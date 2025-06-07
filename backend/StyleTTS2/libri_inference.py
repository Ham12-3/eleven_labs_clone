import torch
import os
import random
import numpy as np
import time
import yaml
from munch import Munch
from torch import nn
import torch.nn.functional as F
import torchaudio
import librosa
from nltk.tokenize import word_tokenize
import soundfile as sf
import nltk

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("Downloading required NLTK data...")
    nltk.download('punkt_tab')
    nltk.download('punkt')

from models import *
from utils import *
from text_utils import TextCleaner

import phonemizer
from Utils.PLBERT.util import load_plbert
from collections import OrderedDict
from Modules.diffusion.sampler import DiffusionSampler, ADPM2Sampler, KarrasSchedule

# Set both the library and data paths
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
os.environ["ESPEAK_DATA_PATH"] = r"C:\Program Files\eSpeak NG\espeak-ng-data"

class StyleTTS2Inference:
    def __init__(self, config_path, model_path):
        # Check if files exist
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.config = yaml.safe_load(open(config_path))
        print(f"Loaded config: {config_path}")
        
        # Check if ASR_path exists in config
        if 'ASR_path' not in self.config:
            raise KeyError("ASR_path not found in config")
        
        asr_path = self.config['ASR_path']
        if not os.path.exists(asr_path):
            raise FileNotFoundError(f"ASR model file not found: {asr_path}")
        
        self.model_params = recursive_munch(self.config['model_params'])
        self.load_models(model_path)
        
        self.to_mel = torchaudio.transforms.MelSpectrogram(
            n_mels=80, n_fft=2048, win_length=1200, hop_length=300)
        self.mean, self.std = -4, 4
        
        # Initialize text cleaner
        self.textcleaner = TextCleaner()
        
        # Test espeak-ng
        try:
            test_phonemes = phonemizer.phonemize("hello world", language='en-us', backend='espeak')
            print("✅ espeak-ng is working correctly!")
            print(f"Test phonemes: {test_phonemes}")
        except Exception as e:
            print(f"❌ espeak-ng error: {e}")
        
        print(f"StyleTTS2 Inference initialized on device: {self.device}")
        
    def load_models(self, model_path):
        # Use the correct key names from your config
        text_aligner = load_ASR_models(self.config['ASR_path'], self.config['ASR_config'])
        
        # Use F0_path instead of F0_config
        pitch_extractor = load_F0_models(self.config['F0_path'])
        
        # Use PLBERT_dir instead of PLBERT_config
        plbert = load_plbert(self.config['PLBERT_dir'])
        
        # Build model shell 
        self.model = build_model(self.model_params, text_aligner, pitch_extractor, plbert)
        
        # load weights - ADD weights_only=False
        params_whole = torch.load(model_path, map_location='cpu', weights_only=False)
        params = params_whole['net']
        
        for key in self.model: 
            if key in params:
                print('%s loaded' % key)
                try:
                    self.model[key].load_state_dict(params[key])
                except:
                    from collections import OrderedDict
                    state_dict = params[key]
                    new_state_dict = OrderedDict()
                    for k, v in state_dict.items():
                        name = k[7:] # remove `module.`
                        new_state_dict[name] = v
                    # load params
                    self.model[key].load_state_dict(new_state_dict, strict=False)
        
        for key in self.model:
            self.model[key].eval()
            self.model[key].to(self.device)
            
        self.sampler = DiffusionSampler(
            self.model.diffusion.diffusion,
            sampler=ADPM2Sampler(),
            sigma_schedule=KarrasSchedule(sigma_min=0.0001, sigma_max=3.0, rho=9.0), # empirical parameters
            clamp=False
        )

    def length_to_mask(self, lengths):
        mask = torch.arange(lengths.max()).unsqueeze(0).expand(lengths.shape[0], -1).type_as(lengths)
        mask = torch.gt(mask + 1, lengths.unsqueeze(1))
        return mask

    def preprocess(self, wave):
        wave_tensor = torch.from_numpy(wave).float()
        mel_tensor = self.to_mel(wave_tensor)
        mel_tensor = (torch.log(1e-5 + mel_tensor.unsqueeze(0)) - self.mean) / self.std
        return mel_tensor

    def compute_style(self, path):
        wave, sr = librosa.load(path, sr=24000)
        audio, index = librosa.effects.trim(wave, top_db=30)
        if sr != 24000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=24000)
        mel_tensor = self.preprocess(audio).to(self.device)

        with torch.no_grad():
            ref_s = self.model.style_encoder(mel_tensor.unsqueeze(1))
            ref_p = self.model.predictor_encoder(mel_tensor.unsqueeze(1))

        return torch.cat([ref_s, ref_p], dim=1)
    
    def text_to_phonemes(self, text):
        """Convert text to phonemes using espeak-ng"""
        return phonemizer.phonemize(
            text, 
            language='en-us', 
            backend='espeak',  # Change from 'espeak-ng' to 'espeak'
            strip=True,
            preserve_punctuation=True
        )
    
    def synthesize(self, text):
        """Main synthesis method"""
        phonemes = self.text_to_phonemes(text)
        print(f"Text: '{text}' -> Phonemes: '{phonemes}'")
        # Add your StyleTTS2 synthesis logic here
        return phonemes
    
    def inference(self, text, ref_s, alpha=0.3, beta=0.7, diffusion_steps=5, embedding_scale=1):
        """Main inference method for StyleTTS2"""
        text = text.strip()
        # Change backend here too:
        ps = phonemizer.phonemize([text], language='en-us', backend='espeak')  # Change from 'espeak-ng'
        ps = word_tokenize(ps[0])
        ps = ' '.join(ps)
        tokens = self.textcleaner(ps)
        tokens.insert(0, 0)
        tokens = torch.LongTensor(tokens).to(self.device).unsqueeze(0)
        
        with torch.no_grad():
            input_lengths = torch.LongTensor([tokens.shape[-1]]).to(self.device)
            text_mask = self.length_to_mask(input_lengths).to(self.device)

            t_en = self.model.text_encoder(tokens, input_lengths, text_mask)
            bert_dur = self.model.bert(tokens, attention_mask=(~text_mask).int())
            d_en = self.model.bert_encoder(bert_dur).transpose(-1, -2) 

            s_pred = self.sampler(noise=torch.randn((1, 256)).unsqueeze(1).to(self.device), 
                                embedding=bert_dur,
                                embedding_scale=embedding_scale,
                                features=ref_s, # reference from the same speaker as the embedding
                                num_steps=diffusion_steps).squeeze(1)

            s = s_pred[:, 128:]
            ref = s_pred[:, :128]

            ref = alpha * ref + (1 - alpha) * ref_s[:, :128]
            s = beta * s + (1 - beta) * ref_s[:, 128:]

            d = self.model.predictor.text_encoder(d_en, s, input_lengths, text_mask)

            x, _ = self.model.predictor.lstm(d)
            duration = self.model.predictor.duration_proj(x)

            duration = torch.sigmoid(duration).sum(axis=-1)
            pred_dur = torch.round(duration.squeeze()).clamp(min=1)

            pred_aln_trg = torch.zeros(input_lengths, int(pred_dur.sum().data))
            c_frame = 0
            for i in range(pred_aln_trg.size(0)):
                pred_aln_trg[i, c_frame:c_frame + int(pred_dur[i].data)] = 1
                c_frame += int(pred_dur[i].data)

            # encode prosody
            en = (d.transpose(-1, -2) @ pred_aln_trg.unsqueeze(0).to(self.device))
            if self.model_params.decoder.type == "hifigan":
                asr_new = torch.zeros_like(en)
                asr_new[:, :, 0] = en[:, :, 0]
                asr_new[:, :, 1:] = en[:, :, 0:-1]
                en = asr_new

            F0_pred, N_pred = self.model.predictor.F0Ntrain(en, s)

            asr = (t_en @ pred_aln_trg.unsqueeze(0).to(self.device))
            if self.model_params.decoder.type == "hifigan":
                asr_new = torch.zeros_like(asr)
                asr_new[:, :, 0] = asr[:, :, 0]
                asr_new[:, :, 1:] = asr[:, :, 0:-1]
                asr = asr_new

            out = self.model.decoder(asr, F0_pred, N_pred, ref.squeeze().unsqueeze(0))
        
        return out.squeeze().cpu().numpy()[..., :-50] # weird pulse at the end of the model, need to be fixed later

# Test the class

if __name__ == "__main__":
    synthesiser = StyleTTS2Inference(
        config_path="Models/LibriTTS/config.yml",
        model_path="Models/LibriTTS/epochs_2nd_00020.pth"
    )

    ref_style = synthesiser.compute_style("reference_audio/reference_audio/3.wav")

    # Generate speech
    audio = synthesiser.inference(
        text="Hello, my name is Abdul and I am now testing with the new fine tuned model.",
        ref_s=ref_style,
    )

    sf.write("output.wav", audio, 24000)




# 1:27:20
