export function getRecipeImage(imagePath: string) {
  switch (imagePath) {
    case 'assets/images/recipes/shakshuka.jpeg':
      return require('../../assets/images/recipes/shakshuka.jpeg');
    case 'assets/images/recipes/pierogi-ruskie.jpeg':
      return require('../../assets/images/recipes/pierogi-ruskie.jpeg');
    case 'assets/images/recipes/roast-chicken.jpg':
      return require('../../assets/images/recipes/roast-chicken.jpg');
    case 'assets/images/recipes/thai-green-curry.jpeg':
      return require('../../assets/images/recipes/thai-green-curry.jpeg');
    case 'assets/images/recipes/aglio-olio.jpeg':
      return require('../../assets/images/recipes/aglio-olio.jpeg');
    case 'assets/images/recipes/teriyaki-salmon.jpeg':
      return require('../../assets/images/recipes/teriyaki-salmon.jpeg');
    case 'assets/images/recipes/chocolate-babka.jpeg':
      return require('../../assets/images/recipes/chocolate-babka.jpeg');
    case 'assets/images/recipes/red-lentil-dal.jpeg':
      return require('../../assets/images/recipes/red-lentil-dal.jpeg');
    default:
      // Fallback or user added custom image
      return require('../../assets/images/recipes/shakshuka.jpeg');
  }
}

export function getEmptyStateImage() {
  return require('../../assets/images/empty-state.png');
}
