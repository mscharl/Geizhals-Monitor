module.exports = class ProductList {

    constructor(...products) {
        this._products = products;
    }

    /**
     * Get the total price
     * @return {Number}
     */
    get totalPrice() {
        return this._products.reduce((total_price, product) => {
            return total_price + product.price
        }, 0);
    }

    /**
     * find a product by name
     * @param {string} name
     * @return {Product|undefined}
     */
    findProduct(name) {
        return this._products.find((product) => {
            return product.name === name;
        });
    }

    /**
     * find a product by name
     * @param {string} name
     * @return {Product|undefined}
     */
    findProductIndex(name) {
        return this._products.findIndex((product) => {
            return product.name === name;
        });
    }

    /**
     *
     * @param {Number} [start]
     * @param {Number} [deleteCount]
     * @param {...Product} [items]
     *
     * @return {ProductList}
     */
    splice(start, deleteCount, ...items) {
        return new ProductList(...this._products.splice(start, deleteCount, ...items));
    }

    /**
     * @return {Product|undefined}
     */
    get first() {
        return this._products[0];
    }

    /**
     * Support Iterable-Protocol
     */
    * [Symbol.iterator]() {
        let nextIndex = 0;

        while(nextIndex < this._products.length) {
            yield this._products[nextIndex++];
        }
    }
};
