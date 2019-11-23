// pages/show/show.js
Page({
  data:{
    currentUser:null,
    restaurantId:null,
    restaurant: {},
    meals: [],
    meal: {},
    reviews: [],
    ratingValues: [1,2,3,4,5],
    rating: 5,
    state: 'comment',
  },

  onLoad: function(options){
    //在页面上保存restaurantId 便于其他function使用
    this.setData({
      restaurantId: options.id
    })

    //列表页:没有options,详情页一般都会有,因为需要取一个ID
    // 在onload方法里，以下两行代码等价，但是在其他function里只能用下面这一行
    // let restaurantId = options.id
    let restaurantId = this.data.restaurantId

    //获取餐厅详情
    let tableName = 'restaurants'
    let Restaurant = new wx.BaaS.TableObject(tableName)
    let page = this
    Restaurant.get(restaurantId).then(function(res){
      page.setData({
        restaurant: res.data 
      })
    })

     //获取餐厅评论
    this.fetchReviews()

    //获取餐厅菜单
    this.fetchMeals()

    //获取当前用户
    wx.BaaS.auth.getCurrentUser().then(function (res) {
      page.setData({
        currentUser: res
      })
    })
  },

  fetchReviews:function(){
    let restaurantId = this.data.restaurantId
    let Review = new wx.BaaS.TableObject('reviews')
    let query = new wx.BaaS.Query()
    query.compare('restaurant_id', '=', restaurantId)
    let page = this
    Review.setQuery(query).find().then(function (res) {
      // console.log(res)
      page.setData({
        reviews: res.data.objects
      })
    })
  },

  fetchMeals: function() {
    let restaurantId = this.data.restaurantId
    let Meal = new wx.BaaS.TableObject('meals')
    let query = new wx.BaaS.Query()
    query.compare('restaurant_id', '=', restaurantId)
    let page = this
    Meal.setQuery(query).find().then(function (res) {
      // console.log(res)
      page.setData({
        meals: res.data.objects
      })
    })
  },

  onChangeRating: function(event){ //定义给bindfuntion的时候都会有event，如果会传参数进来的话就要event
    let index = event.detail.value
    let rating = this.data.ratingValues[index]
    this.setData({
      rating:rating
    })
  },
  onSubmitReview: function(event){
    let content = event.detail.value.content
    let rating = this.data.rating
    //创建一个实例（定义一个母版）
    let Review = new wx.BaaS.TableObject('reviews')

    //保存一个实例（具体的数据放在这里，占内存的东西）
    let review = Review.create()
    review.set({
      user_id: this.data.currentUser.id.toString(),
      restaurant_id: this.data.restaurantId,
      content: content,
      rating: rating
    })

    //将保存的数据上传到服务器
    let page = this
    review.save().then(function (res) {
      page.fetchReviews()
    })
  },
  onSumbitOrder: function(event){
    let currentUser = this.data.currentUser
    let mealId = event.currentTarget.dataset.id
    let points = event.currentTarget.dataset.points
    // wx.showModal({
    //   title: '准备下订单',
    //   content: mealId,
    // })

  let Order = new wx.BaaS.TableObject('orders')
  let order = Order.create()
  order.set({
    user_id: currentUser.id.toString(),
    meal_id:mealId,
    quantity: 1
  })
  //绑定个人积分
  order.save().then(function(res){
    let currentPoints= currentUser.get('points')
    let newPoints = currentPoints+ points
    currentUser.set({
      points: newPoints
    })
    // currentUser.set('points',newPoints)
    currentUser.update().then(function(){
      wx.showModal({
        title: '订单创建成功',
        content: '请前往个人中心查看',
        success(res){
          if(res.confirm){
            wx.reLaunch({
              url: '/pages/orders/orders',
            })
          }else if(res.cancel){
          }
        }
      })
    })
    }).catch(function(err){
      wx.showModal({
      title: '订单创建失败',
      content: '请查看订单状态',
    })
  })
  },

  // onShow: function (options) {

  //   let page = this
  //   let restaurantId = this.data.restaurantId
  //   let Meal = new wx.BaaS.TableObject('meals')
  //   let query = new wx.BaaS.Query()
  //   query.compare('restaurant_id', '=', restaurantId)
  //   Meal.setQuery(query).find().then(function (res) {
  //     console.log('res', res)
  //     page.setData({
  //       meals: res.data.objects
  //     })
  //   })

  //   let restaurantId = this.data.restaurantId
  //   let page = this
  // //  改动部分 meals
  //   let tableName1 = 'meals'
  //   let Meal = new wx.BaaS.TableObject(tableName1)
  //   Meal.get(restaurantId).then(function (res) {
  //   // console.log(res)
  //   page.setData({
  //     meal: res.data
  //   })
  // })
  // }
})
