let
  sources = import ./nix/sources.nix;
  pkgs = import sources.nixpkgs {};
  nodepackages = pkgs.nodePackages;
in
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    nodepackages.uglify-js
    pkgs.go
  ];
}