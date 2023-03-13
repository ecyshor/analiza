{
  nixpkgs = builtins.fetchGit {
    url = "https://github.com/NixOS/nixpkgs.git";
    rev = "6ccc4a59c3f1b56d039d93da52696633e641bc71";
  };
}