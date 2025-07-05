{ pkgs }: {
  deps = [
    pkgs.nodejs_22
    pkgs.chromium
    pkgs.libxcb
    pkgs.glib
    pkgs.libdrm
  ];
}
