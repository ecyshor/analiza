{
  nixpkgs = builtins.fetchGit {
    url = "https://github.com/NixOS/nixpkgs.git";
    rev = "045b51a3ae66f673ed44b5bbd1f4a341d96703bf";
  };
}