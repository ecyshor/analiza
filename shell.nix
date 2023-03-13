let
  sources = import ./sources.nix;
  pkgs = import sources.nixpkgs {};
in
pkgs.mkShell {
  buildInputs = [
    nodejs
    nodepackages.uglifyjs
  ];
}