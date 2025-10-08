{
  nixpkgs = builtins.fetchGit {
    url = "https://github.com/NixOS/nixpkgs.git";
    rev = "d7f52a7a640bc54c7bb414cca603835bf8dd4b10";
  };
}