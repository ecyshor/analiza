let
  sources = import ./sources.nix;
  pkgs = import sources.nixpkgs {};
  nodepackages = pkgs.nodePackages;
in
pkgs.mkShell {
  buildInputs = [
    pkgs.hugo
    pkgs.nodejs
    nodepackages.uglify-js
    pkgs.go
    pkgs.postgresql
  ];
}