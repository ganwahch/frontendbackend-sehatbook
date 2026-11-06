import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-lg border",
        },
      }}
    />
  );
}
