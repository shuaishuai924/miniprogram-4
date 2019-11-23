// pages/index/index.js
Page({
  
  data:{
    restaurants:[]
  },
  onLoad: function(){
    let tableName = 'restaurants'
    let Restaurant = new wx.BaaS.TableObject(tableName)
    let page = this;
    Restaurant.find().then(function(res){
      console.log(res)
      page.setData({
        restaurants: res.data.objects   
      })
    })
  },
  onClick: function(event){
    let restaurantId = event.currentTarget.dataset.id
    let name = event.currentTarget.dataset.name
    // wx.showModal({
    //   title: name + ' 被点击 ',
    // })
    console.log(event.currentTarget)
    wx.navigateTo({
      url: '/pages/show/show?id='+ restaurantId
    })
  }
})
