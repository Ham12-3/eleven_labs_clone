import {create} from 'zustand'

interface UIState {
    isMobileDrawerOpen: boolean;
    isMobileScreen: boolean;
    toggleMobileDrawer: ()=> void;
    setMobileScreen: (isMobile:boolean) => void;
}

export const useUIStore = create<UIState>((set)=> ({
    isMobileDrawerOpen: false,
    isMobileScreen: false,
    toggleMobileDrawer: ()=> set((state)=> ({isMobileDrawerOpen: !state.isMobileDrawerOpen})),
    setMobileScreen: (isMobile)=> set(() => ({isMobileScreen: isMobile}))
}))