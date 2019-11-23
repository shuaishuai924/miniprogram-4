// pages/users/users.js
Page({
  data:{
    currentUser:null,
    state:'register',//'login'
  },

  changeState:function(){
    if(this.data.state == 'register'){ //固定的读data方法
      this.setData({ //固定的写data方法
        state:'login'
      })
    }else{
      this.setData({
        state:'register'
      })
    }
  },
  onRegister:function(event){
    console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    wx.BaaS.auth.register({
      username:username,
      password:password
    }).then(function(res){
      console.log(res)
      page.setData({
        currentUser:res
      })
      }).catch(function (err) {
        wx.showToast({
          title: '注册失败',
          content: err.message
        })
    })
  },

  onLogin: function (event) {
    console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    wx.BaaS.auth.login({
      username: username,
      password: password
    }).then(function (res) { //then的意思是跟服务器请求，需要返回结果，如果是本地操作不需要写then（可以看登出效果
      console.log(res)
      page.setData({
        currentUser: res
      })
    }).catch(function (err) {
      wx.showToast({
        title: '登录失败',
        content: err.message
      })
    })
  },

  onLogout:function(){
    wx.BaaS.auth.logout()
      this.setData({
        currentUser:null
      })
    },

  onSubmitLogin: function (event) {
    console.log(event)
    let username = event.detail.value.username
    let password = event.detail.value.password
    let page = this
    wx.BaaS.auth.login({
      username: username,
      password: password
    }).then(function (res) {
      console.log(res)
      page.setData({
        currentUser: res
      })
    })
  },
  userInfoHandler: function(data){
    //data是加密过的微信账号信息
    let page = this
    wx.BaaS.auth.loginWithWechat(data).then(function(res){
      console.log(res)
      page.setData({
        currentUser: res
      })
    }).catch (function(err) {
      wx.showToast({
        title: '当前用户未登录',
        content: err.message
      })
    })
  },

  onLoad:function(options){
    let page = this
    wx.BaaS.auth.getCurrentUser().then(function(res){
      //设置用户
      // console.log('用户登录成功')
      page.setData({
        currentUser:res
      })
    }).catch(function(err){
      wx.showToast({
        title: '当前用户未登录',
        content:err.message
      })
    })
  }
})