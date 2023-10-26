{
  nixpkgs = builtins.fetchGit {
    url = "https://github.com/NixOS/nixpkgs.git";
    rev = "51d906d2341c9e866e48c2efcaac0f2d70bfd43e";
  };
}