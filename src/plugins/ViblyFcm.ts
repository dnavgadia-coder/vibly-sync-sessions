import { registerPlugin } from "@capacitor/core";

export interface ViblyFcmPlugin {
  getLastFcmToken(): Promise<{ token: string | null }>;
}

const ViblyFcm = registerPlugin<ViblyFcmPlugin>("ViblyFcm");
export default ViblyFcm;
