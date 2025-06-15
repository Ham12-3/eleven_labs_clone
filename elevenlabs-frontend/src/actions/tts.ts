"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type { ServiceType } from "@/types/services";

interface GenerateSpeechRequest {
  text: string;
  voice: string;
  service: ServiceType;
}

interface GenerateSpeechResponse {
  success: boolean;
  data?: {
    id?: string;
    audioUrl: string;
    s3Key: string;
  };
  error?: string;
}

export async function generateSpeech({
  text,
  voice,
  service,
}: GenerateSpeechRequest): Promise<GenerateSpeechResponse> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check user credits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits <= 0) {
      return {
        success: false,
        error: "Insufficient credits",
      };
    }

    // Map frontend voice IDs to backend voice IDs
    const voiceMapping: Record<string, string> = {
      "andreas": "3",
      "woman": "amused", 
      "trump": "sleepy",
    };

    const targetVoice = voiceMapping[voice] ?? voice;

    // Call the StyleTTS2 API
    const apiResponse = await fetch(`${process.env.STYLETTS2_API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.STYLETTS2_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        target_voice: targetVoice,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("StyleTTS2 API error:", errorText);
      return {
        success: false,
        error: "Failed to generate speech",
      };
    }

    const apiResult = await apiResponse.json() as {
      audio_url: string;
      s3_key: string;
    };

    // Save to database and deduct credit
    const audioClip = await db.generatedAudioClip.create({
      data: {
        userId: session.user.id,
        text,
        voice,
        service,
        s3Key: apiResult.s3_key,
      },
    });

    // Deduct credit
    await db.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    return {
      success: true,
      data: {
        id: audioClip.id,
        audioUrl: apiResult.audio_url,
        s3Key: apiResult.s3_key,
      },
    };
  } catch (error) {
    console.error("Generate speech error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getVoices(service: ServiceType): Promise<{
  success: boolean;
  voices?: string[];
  error?: string;
}> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // For StyleTTS2, return our predefined voices
    if (service === "styletts2") {
      return {
        success: true,
        voices: ["andreas", "woman", "trump"],
      };
    }

    // For other services, you can call their respective APIs
    return {
      success: true,
      voices: [],
    };
  } catch (error) {
    console.error("Get voices error:", error);
    return {
      success: false,
      error: "Failed to fetch voices",
    };
  }
} 