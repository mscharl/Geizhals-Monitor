const ProductList = require('../models/ProductList');

module.exports = {

    /**
     * @param {Iterable.<Product>} products
     */
    withProducts(products) {
        return new ProductList(...products);
    }
};
