function getTextWidth(str, fontSize, fontFamily) {
  var span = $('body').append($('<span stlye="display:none;" id="textWidth"/>')).find('#textWidth');
  span.css({
    "font-size": fontSize + "px",
    "font-family": fontFamily || "Consolas"
  });
  var w = span.html(str).width();
  var h = span.html(str).height();
  $('#textWidth').remove();
  return {w: w, h: h};
}

//scene
(function () {

  var SceneManager = window.SceneManager = function (context, canvas, resources, scene) {
    this.context   = context;
    this.canvas    = canvas;
    this.resources = resources;
    this.scene     = scene;
    //  "bg_day": self.resource["bg_day"],
    //  "land": self.resource["land"],
    //  "bird0_0": self.resource["bird0_0"],
    //  "bird0_1": self.resource["bird0_1"],
    //  "bird0_2": self.resource["bird0_2"]
    this.land_image_width      = 336;
    this.land_image_height     = 112;
    this.bgimage_width         = 288;
    this.bgimage_height        = 512;
    this.title_image_width     = 178;
    this.title_image_height    = 48;
    this.bird_image_width      = 48;
    this.bird_image_height     = 48;
    this.button_image_width    = 116;
    this.button_image_height   = 70;
    this.tutorial_image_width  = 114;
    this.tutorial_image_height = 98;

    //custom variable
    bird_variables:{
      this.titleY              = 0;
      this.bird_resource       = this.resources["bird0_0"];
      this.bird_resource_index = 0;
      this.accelerationY       = 0;
      this.deltaY              = 0.8;
      this.interval_with_title = 80;
      this.fixed_y             = (this.canvas.height - this.land_image_height) * 0.25 + this.interval_with_title + this.title_image_height;
      this.y                   = this.fixed_y;

      this.count = 0;
    }

    this.alpha       = 1;
    this.alpha_delta = 0.04;

    this.opacity = "to_light";//to_dark
  }
  SceneManager.prototype.render = function () {

    drawBackground:{
      var x = 0;
      var y = this.canvas.height - this.bgimage_height;
      this.context.drawImage(this.resources["bg_day"], x, y);

      x = this.bgimage_width;
      this.context.drawImage(this.resources["bg_day"], x, y);

      x = this.bgimage_width * 2;
      this.context.drawImage(this.resources["bg_day"], x, y);

      //补一个矩形
      this.context.fillStyle = "#4ec0ca";
      this.context.fillRect(0, 0, this.canvas.width, y);
    }

    drawLand:{
      var x = 0;
      var y = this.canvas.height - this.land_image_height;

      this.context.drawImage(this.resources["land"], x, y);

      x = this.land_image_width;
      this.context.drawImage(this.resources["land"], x, y);

      x = this.land_image_width * 2;
      this.context.drawImage(this.resources["land"], x, y);
    }
    if (this.scene == 0) {
      drawTitle:{
        var x = (this.canvas.width - this.title_image_width) * 0.5;
        var y = (this.canvas.height - this.land_image_height) * 0.25;
        if (this.titleY >= y) {this.titleY = y;}
        this.context.drawImage(this.resources["title"], x, this.titleY);
        // this.context.strokeRect(x, this.titleY, this.title_image_width, this.title_image_height);
      }

      drawBird:{
        var x = (this.canvas.width - this.bird_image_width) * 0.5;
        this.context.drawImage(this.bird_resource, x, this.y);
        // this.context.strokeRect(x, this.y, this.bird_image_width, this.bird_image_height);
        this.y -= this.accelerationY;
        // 情况1: this.accelerationY 开始0 , 相减得负数
        // 情况2: this.accelerationY = 10
        this.accelerationY -= this.deltaY;
      }
      drawButton:{
        this.button_x = (this.canvas.width - this.button_image_width) * 0.5;
        this.button_y = (this.canvas.height - this.land_image_height) * 0.5 + this.button_image_height;
        this.context.drawImage(this.resources["button_play"], this.button_x, this.button_y);
        // this.context.strokeRect(this.button_x, this.button_y, this.button_image_width, this.button_image_height);
      }
    }
    if (this.scene == 1) {
      drawTutorial:{
        var x = (this.canvas.width - this.tutorial_image_width) * 0.5;
        var y = (this.canvas.height - this.land_image_height) * 0.25 + this.interval_with_title + this.title_image_height + this.bird_image_height + 30;
        this.context.save();
        this.context.globalAlpha = this.alpha;
        this.context.drawImage(this.resources["tutorial"], x, y);
        this.context.restore();
        // this.context.strokeRect(x, y, this.tutorial_image_width, this.tutorial_image_height);

      }

      drawBird:{

        var x  = (this.canvas.width - this.bird_image_width) * 0.5;
        this.y = this.fixed_y;
        this.context.drawImage(this.resources["bird0_0"], x, this.y);
        // this.context.strokeRect(x, this.y, this.bird_image_width, this.bird_image_height);
      }
    }
  }

  SceneManager.prototype.handleEvent = function (event, game) {

    var click_x = event.pageX - $(this.canvas).offset().left;
    var click_y = event.pageY - $(this.canvas).offset().top;

    if (this.scene == 0) {
      if (click_x >= this.button_x && click_x <= this.button_x + this.button_image_width &&
        click_y >= this.button_y && click_y <= this.button_y + this.button_image_height) {

        game.scene = 1;
        game.start();
      }
    }
    if (this.scene == 1) {
      game.scene = 2;
      game.start();
    }
  }

  SceneManager.prototype.update = function () {
    this.titleY += 4;
    this.bird_resource = this.resources["bird0_" + this.bird_resource_index];

    this.count++;

    // 煽动翅膀
    if (this.count % 3 == 0) {
      this.bird_resource_index++;
      if (this.bird_resource_index > 2) { this.bird_resource_index = 0; }
    }
    if (this.y >= this.fixed_y) {
      this.accelerationY = 10;
    }

    if (this.opacity == "to_light") {
      this.alpha += this.alpha_delta;
      if (this.alpha >= 0.9) {
        this.opacity = "to_dark";
      }
    }
    if (this.opacity == "to_dark") {
      this.alpha -= this.alpha_delta;
      if (this.alpha <= 0.1) {
        this.opacity = "to_light";
      }
    }
  }

})();
//鸟
(function () {
  var Bird = window.Bird = function (context, canvas, resources) {
    this.context   = context;
    this.canvas    = canvas;
    this.resources = resources;

    this.bird_image_width  = 48;// canvas 420 x 750 // image  288 x 512 图片宽高
    this.bird_image_height = 48;

    this.accelerationY = 0;
    this.deltaY        = 0.8;
    this.radian        = 0;

    this.x = this.canvas.width * (1 - 0.618);
    this.y = 100;

    this.orientation = "down";

    this.resource = this.resources[0];

    this.left   = 0;
    this.right  = 0;
    this.top    = 0;
    this.bottom = 0;

  }
  Bird.prototype.render = function () {

    // 保护现场
    this.context.save();
    this.context.translate(this.x, this.y);
    this.context.rotate(this.radian);

    var bird_x = -this.bird_image_width * 0.5;
    var bird_y = -this.bird_image_height * 0.5;

    this.context.drawImage(this.resource, bird_x, bird_y);

    test_bird:{
      this.context.strokeRect(bird_x, bird_y, 48, 48);

      this.context.font      = "14px Consolas";
      this.context.fillStyle = "black";

      var text_width  = getTextWidth(this.left, 14, "Consolas").w;
      var text_height = getTextWidth(this.left, 14, "Consolas").h;

      /*this.context.fillText(this.left, (this.x - this.bird_image_width * 0.5 - text_width), (this.y - text_height * 0.5));
       this.context.fillText(this.right, (this.x + this.bird_image_width * 0.5), (this.y - text_height * 0.5));
       this.context.fillText(this.top, (this.x - text_width * 0.5), (this.y - this.bird_image_height * 0.5 - text_height));
       this.context.fillText(this.bottom, (this.x - text_width * 0.5), (this.y + this.bird_image_height * 0.5));*/

      // canvas 字符串渲染是 中心点对齐渲染的???
      this.context.fillText(this.left, (bird_x - text_width), (bird_y + this.bird_image_height * 0.5));
      this.context.fillText(this.right, (bird_x + this.bird_image_width), (bird_y + this.bird_image_height * 0.5));

      this.context.fillText(this.top, (bird_x), (bird_y));
      this.context.fillText(this.bottom, (bird_x), (bird_y + this.bird_image_height + text_height));
    }

    // 恢复现场
    this.context.restore();

  }

  Bird.prototype.update = function (game) {
    // 情况1: -负数=正数, this.y 增加 往下加速落,
    // 情况2: this.accelerationY被赋值正数, this.y 在减小 , this.accelerationY 在被消减 会有一个缓冲的效果
    // 等到 this.accelerationY = 0 到达顶点, this.accelerationY 开始变负数
    this.y -= this.accelerationY;
    // 情况1: this.accelerationY 开始0 , 相减得负数
    // 情况2: this.accelerationY = 10
    this.accelerationY -= this.deltaY;

    switch (true) {
      case this.accelerationY == 0: // up 顶点
        this.radian   = 0;
        this.resource = this.resources[1];
        break;
      case this.accelerationY > 0: // up
        this.radian   = -10 * Math.PI / 180;
        this.resource = this.resources[2];
        break;
      case this.accelerationY < 0: // down
        this.radian   = 10 * Math.PI / 180;
        this.resource = this.resources[0];
        if (this.y > (this.canvas.height - game.land.land_image_height)) {
          clearInterval(game.timer);
        }
        break;
      default:
        console.log("结束")
    }

    this.left   = this.x - 24;
    this.right  = this.x + 24;
    this.top    = (this.y - 24).toFixed(2);
    this.bottom = (this.y + 24).toFixed(2);
  }

  Bird.prototype.fly = function () {
    this.accelerationY = 10;
  }
})();
//管子
(function () {
  var Pipe = window.Pipe = function (context, canvas, resource_up, resource_down) {
    this.context       = context;
    this.canvas        = canvas;
    this.resource_up   = resource_up;
    this.resource_down = resource_down;

    this.pipe_image_width  = 52;// canvas 420 x 750 // image  288 x 512 图片宽高
    this.pipe_image_height = 320;

    this.dx = 0;//这个是图片水平变化的属性

    this.interval    = 180;
    this.land_height = 112;

    var range                = this.canvas.height - this.land_height;
    var pipe_up_height_range = range - this.interval - this.pipe_image_height;
    this.cutHeight           = Math.floor(Math.random() * (this.pipe_image_height - pipe_up_height_range)) + pipe_up_height_range;

    this.x = this.canvas.width;

    this.up_pipe_height   = 0;
    this.down_pipe_height = 0;

    this.up_pipe_left   = 0;
    this.up_pipe_right  = 0;
    this.up_pipe_top    = 0;
    this.up_pipe_bottom = 0;

    this.down_pipe_left   = 0;
    this.down_pipe_right  = 0;
    this.down_pipe_top    = 0;
    this.down_pipe_bottom = 0;

  }
  Pipe.prototype.render = function () {
    if (this.dx % 1 != 0) {
      return;
    }
    //画up
    var x         = this.x - this.dx;
    var y         = 0;
    var cutWidth  = this.pipe_image_width;
    var cutHeight = this.cutHeight;
    var cutX      = 0;
    var cutY      = this.pipe_image_height - cutHeight;
    var width     = cutWidth;
    var height    = cutHeight;

    this.up_pipe_height = height;

    // 9个参数时 可以裁剪, 前4个参数, 在原始图片大小中的位置, 后4个参数 指定 宽高和位置
    this.context.drawImage(this.resource_down, cutX, cutY, cutWidth, cutHeight, x, y, width, height);

    test_pipe_up:{
      this.context.font = "14 Consolas";
      var size          = getTextWidth(this.up_pipe_left, 14, "Consolas");

      this.context.fillText(this.up_pipe_left, this.up_pipe_left - size.w - 5, y + this.up_pipe_height);
      this.context.fillText(this.up_pipe_right, this.up_pipe_right, y + this.up_pipe_height);
      this.context.fillText(this.up_pipe_top, this.x - this.dx + size.w * 0.5, size.h);
      this.context.fillText(this.up_pipe_bottom, this.x - this.dx + size.w * 0.5, y + size.h + this.up_pipe_height);

      this.up_pipe_left   = this.x - this.dx;
      this.up_pipe_right  = this.x - this.dx + this.pipe_image_width;
      this.up_pipe_top    = 0;
      this.up_pipe_bottom = this.up_pipe_height;
    }

    var pipe_down_height = height;
    var up_height        = this.canvas.height - this.land_height - pipe_down_height - this.interval;
    x                    = this.x - this.dx;
    y                    = pipe_down_height + this.interval;
    cutWidth             = this.pipe_image_width;
    cutHeight            = up_height;
    cutX                 = 0;
    cutY                 = 0;
    width                = cutWidth;
    height               = cutHeight;

    this.down_pipe_height = height;

    this.context.drawImage(this.resource_up, cutX, cutY, cutWidth, cutHeight, x, y, width, height);

    test_pipe_down:{
      this.context.font = "14 Consolas";
      var size          = getTextWidth(this.down_pipe_left, 14, "Consolas");

      this.context.fillText(this.down_pipe_left, this.down_pipe_left - size.w - 5, y + size.h);
      this.context.fillText(this.down_pipe_right, this.down_pipe_right, y + size.h);
      this.context.fillText(this.down_pipe_top, this.x - this.dx + size.w * 0.5, y);
      this.context.fillText(this.down_pipe_bottom, this.x - this.dx + size.w * 0.5, y + this.down_pipe_height);

      this.down_pipe_left   = this.x - this.dx;
      this.down_pipe_right  = this.x - this.dx + this.pipe_image_width;
      this.down_pipe_top    = this.up_pipe_height + this.interval;
      this.down_pipe_bottom = this.canvas.height - this.land_height;
    }

  }
  Pipe.prototype.update = function (speed) {
    this.dx += speed;
  }

  Pipe.prototype.compare = function (game) {

    var bird  = game.bird;
    var timer = game.timer;
    var pipe  = this;

    /*    this.up_pipe_left     = this.x;
     this.up_pipe_right    = this.x + this.pipe_image_width;
     this.up_pipe_top      = 0;
     this.up_pipe_bottom   = this.up_pipe_height;
     this.down_pipe_left   = this.x;
     this.down_pipe_right  = this.x + this.pipe_image_width;
     this.down_pipe_top    = this.up_pipe_height + this.interval;
     this.down_pipe_bottom = this.canvas.height - this.land_height - (this.up_pipe_height + this.interval);*/

    if (bird.right >= pipe.up_pipe_left && bird.right <= pipe.up_pipe_right) {
      if (bird.top >= pipe.up_pipe_top && bird.top <= pipe.up_pipe_bottom) {
        clearInterval(game.timer);
      }
    }

    if (bird.left >= pipe.up_pipe_left && bird.left <= pipe.up_pipe_right) {
      if (bird.top >= pipe.up_pipe_top && bird.top <= pipe.up_pipe_bottom) {
        clearInterval(game.timer);
      }
    }
    if (bird.right >= pipe.down_pipe_left && bird.right <= pipe.down_pipe_right) {
      if (bird.bottom >= pipe.down_pipe_top && bird.top <= pipe.down_pipe_bottom) {
        clearInterval(game.timer);
      }
    }

    if (bird.left >= pipe.down_pipe_left && bird.left <= pipe.down_pipe_right) {
      if (bird.bottom >= pipe.down_pipe_top && bird.top <= pipe.down_pipe_bottom) {
        clearInterval(game.timer);
      }
    }

  }

})();

//大地
(function () {
  var Land = window.Land = function (context, canvas, resource) {
    this.context  = context;
    this.canvas   = canvas;
    this.resource = resource;

    this.land_image_width  = 336;// canvas 420 x 750 // image  288 x 512 图片宽高
    this.land_image_height = 112;

    this.dx = 0;//这个是图片水平变化的属性
  }

  Land.prototype.render = function () {
    var y = this.canvas.height - this.land_image_height;

    var x = 0;
    this.context.drawImage(this.resource, x - this.dx, y);

    x = this.land_image_width;
    this.context.drawImage(this.resource, x - this.dx, y);

    x = this.land_image_width * 2;
    this.context.drawImage(this.resource, x - this.dx, y);
  }

  Land.prototype.update = function (speed) {
    this.dx += speed;
    if (this.dx >= this.land_image_width) {
      console.log(this.dx);
      console.log(this.land_image_width);
      this.dx = 0;
    }
  }
})();
//背景
(function () {
  var Background = window.Background = function (context, canvas, resource) {
    this.context  = context;
    this.canvas   = canvas;
    this.resource = resource;

    this.bgimage_width  = 288;// canvas 420 x 750 // image  288 x 512 图片宽高
    this.bgimage_height = 512;

    this.frame = 0;
    this.dx    = 0;//这个是图片水平变化的属性
  }
  Background.prototype.render = function () {

    this.context.font = "16px Helvetica Neue";
    var y             = this.canvas.height - this.bgimage_height;

    var x = 0;
    this.context.drawImage(this.resource, x - this.dx, y);

    x = this.bgimage_width;
    this.context.drawImage(this.resource, x - this.dx, y);

    x = this.bgimage_width * 2;
    this.context.drawImage(this.resource, x - this.dx, y);

    //补一个矩形
    this.context.fillStyle = "#4ec0ca";
    this.context.fillRect(0, 0, this.canvas.width, y);

    // frame
    this.context.fillStyle = "#000";
    this.context.fillText("frame:" + this.frame, 0, 16);

  }
  Background.prototype.update = function (speed) {

    this.dx += speed;
    this.frame++;
    if (this.dx >= this.bgimage_width) {

      console.log(this.dx);
      console.log(this.bgimage_width);

      this.dx = 0;
    }
  }

})();
//game
(function () {
  var Game = window.Game = function (context, canvas) {

    this.context  = context;
    this.canvas   = canvas;
    this.resource = this.loadResource();
    this.speed    = 3;// 取值范围 [ 1, 2, 3, 4, 6, 8, 12, 16, 24, 48 ];

    // 场景0
    this.scene = 0;

    var width  = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;// - 6;

    this.canvas.width  = width > 420 ? 420 : width;
    this.canvas.height = height > 750 ? 750 : height;

    var self = this;

    loadFile:{
      var count     = 0;
      // key做成数组
      var picAmount = Object.keys(this.resource).length;

      for (var key in this.resource) {
        var src                = this.resource[key];
        this.resource[key]     = new Image();
        this.resource[key].src = src;

        this.resource[key].onload = function () {
          count++;
          self.clearRect();
          self.context.font = "16px Helvetica Neue";
          self.context.fillText("已经加载完毕:" + count + "/" + picAmount, 0, 16);

          // console.log("加载完毕");
          // 开启游戏
          if (count == picAmount) {
            self.start();
          }
        }
      }
    }
  }
  Game.prototype.bindEvent      = function () {

    var self            = this;
    self.canvas.onclick = function (event) {
      self.bird.fly();
    }
  }
  Game.prototype.bindSceneEvent = function () {

    var self = this;

    self.canvas.onclick = function (event) {
      self.scenemanager.handleEvent(event, self);
    }
  }

  Game.prototype.clearRect = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  Game.prototype.loadResource = function () {
    var resource = {
      "bg_day": "./images/bg_day.png",
      "bg_night": "./images/bg_night.png",
      "bird0_0": "./images/bird0_0.png",
      "bird0_1": "./images/bird0_1.png",
      "bird0_2": "./images/bird0_2.png",
      "bird1_0": "./images/bird1_0.png",
      "bird1_1": "./images/bird1_1.png",
      "bird1_2": "./images/bird1_2.png",
      "bird2_0": "./images/bird2_0.png",
      "bird2_1": "./images/bird2_1.png",
      "bird2_2": "./images/bird2_2.png",
      "black": "./images/black.png",
      "blink_00": "./images/blink_00.png",
      "blink_01": "./images/blink_01.png",
      "blink_02": "./images/blink_02.png",
      "brand_copyright": "./images/brand_copyright.png",
      "button_menu": "./images/button_menu.png",
      "button_ok": "./images/button_ok.png",
      "button_pause": "./images/button_pause.png",
      "button_play": "./images/button_play.png",
      "button_rate": "./images/button_rate.png",
      "button_resume": "./images/button_resume.png",
      "button_score": "./images/button_score.png",
      "button_share": "./images/button_share.png",
      "font_048": "./images/font_048.png",
      "font_049": "./images/font_049.png",
      "font_050": "./images/font_050.png",
      "font_051": "./images/font_051.png",
      "font_052": "./images/font_052.png",
      "font_053": "./images/font_053.png",
      "font_054": "./images/font_054.png",
      "font_055": "./images/font_055.png",
      "font_056": "./images/font_056.png",
      "font_057": "./images/font_057.png",
      "land": "./images/land.png",
      "medals_0": "./images/medals_0.png",
      "medals_1": "./images/medals_1.png",
      "medals_2": "./images/medals_2.png",
      "medals_3": "./images/medals_3.png",
      "new": "./images/new.png",
      "number_context_00": "./images/number_context_00.png",
      "number_context_01": "./images/number_context_01.png",
      "number_context_02": "./images/number_context_02.png",
      "number_context_03": "./images/number_context_03.png",
      "number_context_04": "./images/number_context_04.png",
      "number_context_05": "./images/number_context_05.png",
      "number_context_06": "./images/number_context_06.png",
      "number_context_07": "./images/number_context_07.png",
      "number_context_08": "./images/number_context_08.png",
      "number_context_09": "./images/number_context_09.png",
      "number_context_10": "./images/number_context_10.png",
      "number_score_00": "./images/number_score_00.png",
      "number_score_01": "./images/number_score_01.png",
      "number_score_02": "./images/number_score_02.png",
      "number_score_03": "./images/number_score_03.png",
      "number_score_04": "./images/number_score_04.png",
      "number_score_05": "./images/number_score_05.png",
      "number_score_06": "./images/number_score_06.png",
      "number_score_07": "./images/number_score_07.png",
      "number_score_08": "./images/number_score_08.png",
      "number_score_09": "./images/number_score_09.png",
      "pipe2_down": "./images/pipe2_down.png",
      "pipe2_up": "./images/pipe2_up.png",
      "pipe_down": "./images/pipe_down.png",
      "pipe_up": "./images/pipe_up.png",
      "score_panel": "./images/score_panel.png",
      "text_game_over": "./images/text_game_over.png",
      "text_ready": "./images/text_ready.png",
      "title": "./images/title.png",
      "tutorial": "./images/tutorial.png",
      "white": "./images/white.png",
    }
    return resource;
  }

  Game.prototype.start = function () {

    var self = this;

    // 0号场景

    clearInterval(self.scenetimer);

    switch (this.scene) {
      case 0:
        call_scene(this.scene);
        break;
      case 1:
        call_scene(this.scene);
        break;
      case 2:
        call_start_game();
        break;
      default:
        console.log("call default")
    }

    function call_scene(scene) {
      self.scenemanager = new SceneManager(self.context, self.canvas, {
        "bg_day": self.resource["bg_day"],
        "land": self.resource["land"],
        "bird0_0": self.resource["bird0_0"],
        "bird0_1": self.resource["bird0_1"],
        "bird0_2": self.resource["bird0_2"],
        "title": self.resource["title"],
        "button_play": self.resource["button_play"],
        "tutorial": self.resource["tutorial"],
      }, scene);
      // 游戏初始化时 用的...
      self.bindSceneEvent();

      function toupdatescene() {
        self.scenemanager.render();
        self.scenemanager.update();
      }

      self.scenetimer = null;
      clearInterval(self.scenetimer);
      toupdatescene();
      self.scenetimer = setInterval(toupdatescene, 31);

    }

    function call_course() {

    }

    function call_start_game() {
      // 游戏开始时 用的
      self.bindEvent();

      self.background = new Background(self.context, self.canvas, self.resource["bg_day"]);
      self.land       = new Land(self.context, self.canvas, self.resource["land"]);
      self.pipe       = [];
      self.bird       = new Bird(self.context, self.canvas, [
        self.resource["bird0_0"],
        self.resource["bird0_1"],
        self.resource["bird0_2"]
      ]);
      var count       = 0;

      function toUpdate() {

        self.clearRect();

        self.background.render();
        self.background.update(self.speed);
        self.land.render();
        self.land.update(self.speed);

        self.bird.render();
        self.bird.update(self);

        // 创建pipe
        create_pipe:{

          if (count % (4 * 15) == 0) { self.pipe.push(new Pipe(self.context, self.canvas, self.resource["pipe_up"], self.resource["pipe_down"])); }

          for (var i = 0; i < self.pipe.length; ++i) {
            var pipe = self.pipe[i];

            // 出去的管子从数组中删除
            if (pipe.x - pipe.dx + pipe.pipe_image_width < 0) { self.pipe.splice(i--, 1); }

            pipe.render();
            pipe.update(self.speed);

            pipe.compare(self);
          }

          count++;
        }
      }

      self.timer = null;
      clearInterval(self.timer);
      toUpdate();
      self.timer = setInterval(toUpdate, 31);
    }

  }

})();
