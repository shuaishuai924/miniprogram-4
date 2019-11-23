// pages/products/products.js

Page({
  data:{
    totalPrice: 15,
    products: [],
    carts: [],
    currentUser: null,
  },

  onLoad: function () {
    this.fetchProducts()
    this.fetchCarts()
    let page = this
    wx.BaaS.auth.getCurrentUser().then(function (res) {
      console.log(res)
      page.setData({
        currentUser: res
      })
    })
  },

  fetchProducts: function(){
    let page = this
    let tableName = 'products'
    let Products = new wx.BaaS.TableObject('products')
    Products.find().then(function (res) {
      page.setData({
        products: res.data.objects
      })
      page.fetchCarts()
    })
  },

  fetchCarts: function () {
    let Cart = new wx.BaaS.TableObject('carts')
    let page = this
    Cart.find().then(function (res) {
      // console.log(res)
      page.setData({
        carts: res.data.objects
      })
      let carts = page.data.carts
      page.data.products.forEach(function (product) {
        let cart = carts.find((cart) => cart.product.id == product.id)
        if (cart) {
          product.quantity = cart.quantity
          product.cart_id = cart.id
        } else {
          //product不在购物车里，什么都不做
        }
      })
      page.setData({
        products: page.data.products
      })
      page.updateTotalPrice()
    })
  },

  onAdd: function (event) {
    let productId = event.currentTarget.dataset.id
    //只要涉及到取ID都要用这个代码
    let product =
      this.data.products.find((product) => product.id == productId)
    // console.log(product)
    if (product.quantity) {
      product.quantity += 1
    } else {
      product.quantity = 1
    }
    // console.log(product.quantity)
    this.setData({
      products: this.data.products
    })
  },

  onMinus: function (event) {
    let productId = event.currentTarget.dataset.id
    //只要涉及到取ID都要用这个代码
    let product =
      this.data.products.find((product) => product.id == productId)
    // console.log(product)
    if (product.quantity) {
      product.quantity -= 1
    } else {
      product.quantity = 0
    }
    // console.log(product.quantity)
    this.setData({
      products: this.data.products
    })
  },

  updateTotalPrice: function () {
    let totalPrice = 0
    this.data.products.forEach(function (product) {
      let price =
        product.quantity ? product.price * product.quantity : 0
      totalPrice += price
    })
    this.setData({
      totalPrice: totalPrice
    })
  },

  addToCart: function (product, quantity) {
    //加入购物车保存其数据，确定我是谁
    let Cart = new wx.BaaS.TableObject('carts')
    if (quantity <= 0 && product.cart_id) {
      //应该删除购物车
      Cart.delete(product.cart_id).then(function () {
        delete product.cart_id
        wx.showToast({
          title: '删除购物车成功'
        })
      })
      return
    }

    if (quantity <= 0) {
      //product 没有添加过购物车,同时quantity是0，什么也不干
      return
    }


    let cart
    if (product.cart_id) {
      cart = Cart.getWithoutData(product.cart_id)
    } else {
      cart = Cart.create()
    }

    cart.set({
      user: this.data.currentUser.id.toString(),
      product: product.id,
      quantity: quantity,
      price: product.price * quantity
    })

    if (product.cart_id) {
      cart.update().then(function () {
        wx.showToast({
          title: '更新购物车成功'
        })
      })
    } else {
      cart.save().then(function (res) {
        //新建购物车以后，把cart id记录在product上，方便下次更新
        product.cart_id = res.data.id
        wx.showToast({
          title: '添加购物车成功'
        })
      })
    }
  }

})