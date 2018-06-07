document.ontouchmove = function (ev) {ev.preventDefault();};

(function () {

  var Game = window.Game = function () {
    this.col_count        = 10;
    this.row_count        = 10;
    this.width            = 70;
    this.height           = 70;
    this.isCanTouch       = true;
    this.direction        = 0; // 1 右 2 左 3 下 4 上
    this.destination_li   = null;
    this.li_list          = null; //原生li集合
    this.verticalArrayObj = null;

    this.init();
  };

  Game.prototype.init = function () {
    this.ul_tag = $('#box');

    this.createMap();

    this.showMap();

    this.removeContinuation();

    this.bindEvent();
  };

  Game.prototype.createMap = function () {

    this.ul_tag.css({width: this.col_count * this.width, height: this.row_count * this.height});

    var numX = 0;
    var numY = 0;

    for (var i = 0; i < this.row_count * this.col_count; i++) {

      var li_tag = $('<li>');

      var className = 'box' + Math.floor(Math.random() * 6);

      li_tag.prop('class', className);

      numX = i % this.col_count;

      numY = parseInt(i / this.col_count);

      li_tag.data({x: numX, y: numY});

      li_tag.html('<p>' + className + '</p><p>' + numX + '列★' + numY + '行</p>');

      this.ul_tag.append(li_tag);
    }
  };

  Game.prototype.showMap = function () {

    this.li_list = this.ul_tag[0].getElementsByTagName('li');

    /*var _this = this;
    this.li_list = [];

    $("ul li").each(function (index, element) {
      _this.li_list.push(element);
    });*/

    var _li_list = [];

    $("ul li").each(function (index, element) {
      _li_list.push(element);
    });

    console.log(this.li_list);
    console.log(_li_list);



    var offsetLeftTopList = [];

    $(this.li_list).each(function (index, element) {
      offsetLeftTopList.push([element.offsetLeft, element.offsetTop]);
    });

    $(this.li_list).each(function (index, element) {
      $(element).css({
        position: 'absolute',
        left    : offsetLeftTopList[index][0],
        top     : offsetLeftTopList[index][1]
      });
    });

    this.offsetLeftTopList = offsetLeftTopList;
  };

  Game.prototype.removeContinuation = function () {

    //水平方向和垂直方向挨着的所有方块
    var continuousBoxListHorizontalAndVertical = [];
    var _this                                  = this;

    function findContinuousBox(li_list) {

      var previous_li = li_list[0];

      // 如果相同颜色就++, 不相同就置0
      var iNum = 0;

      for (var i = 0; i < li_list.length; i++) {
        if (li_list[i].className == previous_li.className && i % _this.col_count != 0) {
          // 寻找相同类名的, 相同颜色挨着的方块
          iNum++;

        } else {
          //连续的如果有3个或者更多
          if (iNum >= 2) {
            for (var j = 0; j <= iNum; j++) {
              // 存储到准备删除的数组中...
              continuousBoxListHorizontalAndVertical.unshift(li_list[(i - 1) - j]);
            }
          }
          iNum = 0;
        }

        previous_li = li_list[i];
      }

      // 防止遗漏最后一个
      if (iNum >= 2) {
        for (var j = 0; j <= iNum; j++) {
          continuousBoxListHorizontalAndVertical.unshift(li_list[(i - 1) - j]);
        }
      }
    }

    // 水平方向寻找
    findContinuousBox(this.li_list);
    // 垂直方向寻找
    findContinuousBox(this.horizontalArrayToVerticalArray(this.li_list));

    for (var i = 0; i < continuousBoxListHorizontalAndVertical.length; i++) {

      for (var j = 0; j < this.li_list.length; j++) {
        if (continuousBoxListHorizontalAndVertical[i] == this.li_list[j]) {
          this.li_list[j].deleteMark = true;
        }
      }
    }

    var remove_count   = 0;
    var remove_li_list = [];
    var verticalArr    = [];

    for (var i = 0; i < this.li_list.length; i++) {

      // console.log("i=", i, $(this.li_list[i]).data('x'));

      if (this.li_list[i].deleteMark) {
        remove_count++;
        remove_li_list.push(this.li_list[i]);
      }
    }

    if (remove_li_list.length) {
      // 有能删除的
      this.isCanTouch = false; //动画时 不能触摸
      this.direction  = 0;
    } else {
      // 没有能删除的
      this.toReset();
      return;
    }

    for (var i = 0; i < remove_li_list.length; i++) {

      //水平数组的x是列 == 垂直数组的行
      var col_index = $(remove_li_list[i]).data('x'); // range: [0~6] 每一行

      var verticalArrayColumnList = this.verticalArrayObj[col_index];

      for (var j = 0; j < verticalArrayColumnList.length; j++) {

        if (remove_li_list[i] === verticalArrayColumnList[j]) {

          verticalArrayColumnList.iNum++;
          verticalArrayColumnList.splice(j, 1);

          //原生li
          var li = this.oneLi(col_index, verticalArrayColumnList.iNum);

          verticalArrayColumnList.unshift(li);
        }
      }
    }

    // 二维数组 转 一维数组
    for (var i = 0; i < this.col_count; i++) {
      verticalArr = verticalArr.concat(this.verticalArrayObj[i]);
    }

    // 数组旋转
    var horizontalArr = this.verticalArrayToHorizontalArray(verticalArr);

    var remove_count = 0;

    for (var i = 0; i < remove_li_list.length; i++) {

      $(remove_li_list[i]).animate({opacity: 0}, function () {

        $(this).remove();//下树

        remove_count++;

        // 删除完毕
        if (remove_count === remove_li_list.length) {

          // jQuery 有类名的tag 重复添加 不会叠加...//重新布局
          // console.log("pre",_this.ul_tag.children('li'));

          // console.log(_this.li_list);
          // horizontalArr是数组不能影响dom数上的节点.
          for (var i = 0; i < horizontalArr.length; i++) {
            _this.ul_tag.append(horizontalArr[i]);
          }
          // 重新添加之后 _this.li_list就变了 , 因为 _this.li_list指向 ul_tag[0].getElementsByTagName('li');
          // DOM中的【任何更改都会反映在集合中】
          // console.log(_this.li_list);

          // _this.li_list = horizontalArr;
          //这步操作之后 this.li_list = horizontalArr;
          // console.log("after",_this.ul_tag.children('li'));
          // console.log("■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■");

          var numX = 0;
          var numY = 0;

          for (var i = 0; i < _this.li_list.length; i++) {

            numX = i % _this.col_count;
            numY = parseInt(i / _this.col_count);

            $(_this.li_list).eq(i).data({x: numX, y: numY});
            $(_this.li_list).eq(i).html('<p>' + $(_this.li_list).eq(i).prop('class') + '</p><p>' + numX + '列★' + numY + '行</p>');
          }
          _this.movePos();
        }
      });
    }
  };

  Game.prototype.oneLi = function (col_index, verticalArrayColumnList_iNum) {
    var $li = $('<li>');

    var className = 'box' + Math.floor(Math.random() * 6);
    $li.prop('class', className);

    $li.css({
      position: 'absolute',
      left    : col_index * this.width,
      top     : -verticalArrayColumnList_iNum * this.height
      // iNum值 大于0 取负数 , 因此li在ul的外面
    });

    $li.html('<p>' + className + '</p><p>' + col_index * this.width + '列★' + -verticalArrayColumnList_iNum * this.height + '行</p>');

    this.ul_tag.append($li);

    return $li.get(0); //$(this).get(0)与$(this)[0]等价。获取原生元素
  };

  Game.prototype.bindEvent = function () {
    var startClientX = 0;
    var startClientY = 0;
    var _this        = this;
    var izIndex      = 2;
    var start_li     = null;

    this.ul_tag.delegate('li', 'touchstart mousedown', function (event) {

      var event    = event.originalEvent.changedTouches ? event.originalEvent.changedTouches[0] : event;
      startClientX = event.clientX;
      startClientY = event.clientY;
      start_li     = this;

      return false;
    });

    this.ul_tag.delegate('li', 'touchend mouseup', function (event) {

      var event = event.originalEvent.changedTouches ? event.originalEvent.changedTouches[0] : event;

      // 移动量超过10像素 触发
      if (_this.isCanTouch && (Math.abs(startClientX - event.clientX) > 10 || Math.abs(startClientY - event.clientY) > 10)) {

        $(start_li).css('zIndex', izIndex++);

        if (Math.abs(startClientX - event.clientX) > Math.abs(startClientY - event.clientY)) { // 左右

          if (startClientX < event.clientX) { //→

            if ($(start_li).data('x') != _this.col_count - 1) {

              _this.direction = 1;

              var index = $(start_li).data('x') + 1 + $(start_li).data('y') * _this.col_count;

              var nextLi = $(_this.ul_tag).find('li').eq(index);

              $(start_li).insertAfter(nextLi);

              $(start_li).animate({left: _this.offsetLeftTopList[index][0]}, 300);

              nextLi.animate({left: _this.offsetLeftTopList[index - 1][0]}, 300);

              $(start_li).data('x', $(start_li).data('x') + 1);

              nextLi.data('x', nextLi.data('x') - 1);

              _this.destination_li = nextLi;
            }
          } else { //←
            if ($(start_li).data('x') != 0) {

              _this.direction = 2;

              var index = $(start_li).data('x') - 1 + $(start_li).data('y') * _this.col_count;

              var prevLi = $(_this.ul_tag).find('li').eq(index);

              $(start_li).insertBefore(prevLi);

              $(start_li).animate({left: _this.offsetLeftTopList[index][0]}, 300);

              prevLi.animate({left: _this.offsetLeftTopList[index + 1][0]}, 300);

              $(start_li).data('x', $(start_li).data('x') - 1);

              prevLi.data('x', prevLi.data('x') + 1);

              _this.destination_li = prevLi;
            }
          }
        } else { //上下
          if (startClientY < event.clientY) { //↓

            if ($(start_li).data('y') != _this.col_count - 1) {

              _this.direction = 3;

              var index = $(start_li).data('x') + ($(start_li).data('y') + 1) * _this.col_count;

              var downLi = $(_this.ul_tag).find('li').eq(index);

              var prevThis = $(start_li).prev();

              $(start_li).insertAfter(downLi);

              downLi.insertAfter(prevThis);

              $(start_li).animate({top: _this.offsetLeftTopList[index][1]}, 300);

              downLi.animate({top: _this.offsetLeftTopList[index - _this.col_count][1]}, 300);

              $(start_li).data('y', $(start_li).data('y') + 1);

              downLi.data('y', downLi.data('y') - 1);

              _this.destination_li = downLi;
            }
          } else { //↑
            if ($(start_li).data('y') != 0) {
              _this.direction = 4;

              var index = $(start_li).data('x') + ($(start_li).data('y') - 1) * _this.col_count;

              var upLi = $(_this.ul_tag).find('li').eq(index);

              var prevThis = $(start_li).prev();

              $(start_li).insertAfter(upLi);

              upLi.insertAfter(prevThis);

              $(start_li).animate({top: _this.offsetLeftTopList[index][1]}, 300);

              upLi.animate({top: _this.offsetLeftTopList[index + _this.col_count][1]}, 300);

              $(start_li).data('y', $(start_li).data('y') - 1);

              upLi.data('y', upLi.data('y') + 1);

              _this.destination_li = upLi;
            }
          }
        }
        _this.removeContinuation();
      }
      return false;
    });
  };

  Game.prototype.horizontalArrayToVerticalArray = function (li_list) {
    var _this             = this;
    var arr               = [];
    this.verticalArrayObj = {};
    var iNum              = 0;

    for (var i = 0; i < this.col_count; i++) {
      this.verticalArrayObj[i]      = [];
      this.verticalArrayObj[i].iNum = 0;
    }

    while (iNum != _this.col_count) {

      for (var i = 0; i < li_list.length; i++) {
        if (i % _this.col_count == iNum) {
          arr.push(li_list[i]);
          _this.verticalArrayObj[iNum].push(li_list[i]);
        }
      }

      iNum++;
    }

    return arr;
  };

  Game.prototype.verticalArrayToHorizontalArray = function (li_list) {
    var _this             = this;
    var arr               = [];
    this.verticalArrayObj = {};
    var iNum              = 0;

    for (var i = 0; i < this.col_count; i++) {
      this.verticalArrayObj[i]      = [];
      this.verticalArrayObj[i].iNum = 0;
    }

    while (iNum != _this.col_count) {

      for (var i = 0; i < li_list.length; i++) {
        if (i % _this.col_count == iNum) {
          arr.push(li_list[i]);
          _this.verticalArrayObj[iNum].push(li_list[i]);
        }
      }

      iNum++;
    }

    return arr;
  };

  Game.prototype.movePos = function () {

    var lock  = true;
    var _this = this;

    for (var i = 0; i < this.li_list.length; i++) {

      var top = this.offsetLeftTopList[i][1]; //固定不变的...

      $(this.li_list[i]).animate({top: top}, function () {

        if (lock) {
          lock             = false;
          _this.isCanTouch = true;
          _this.removeContinuation();
        }
      });
    }
  };

  Game.prototype.toReset = function () {

    // console.log(this.direction);

    switch (this.direction) {
      case 1:
        var index = $(this.destination_li).data('x') + 1 + $(this.destination_li).data('y') * this.col_count;

        var nextLi = $(this.ul_tag).find('li').eq(index);

        $(this.destination_li).insertAfter(nextLi);

        $(this.destination_li).animate({left: this.offsetLeftTopList[index][0]}, 300);

        nextLi.animate({left: this.offsetLeftTopList[index - 1][0]}, 300);

        $(this.destination_li).data('x', $(this.destination_li).data('x') + 1);

        nextLi.data('x', nextLi.data('x') - 1);

        break;
      case 2:
        var index = $(this.destination_li).data('x') - 1 + $(this.destination_li).data('y') * this.col_count;

        var prevLi = $(this.ul_tag).find('li').eq(index);

        $(this.destination_li).insertBefore(prevLi);

        $(this.destination_li).animate({left: this.offsetLeftTopList[index][0]}, 300);

        prevLi.animate({left: this.offsetLeftTopList[index + 1][0]}, 300);

        $(this.destination_li).data('x', $(this.destination_li).data('x') - 1);

        prevLi.data('x', prevLi.data('x') + 1);

        break;
      case 3:
        var index = $(this.destination_li).data('x') + ($(this.destination_li).data('y') + 1) * this.col_count;

        var downLi = $(this.ul_tag).find('li').eq(index);

        var prevThis = $(this.destination_li).prev();

        $(this.destination_li).insertAfter(downLi);

        downLi.insertAfter(prevThis);

        $(this.destination_li).animate({top: this.offsetLeftTopList[index][1]}, 300);

        downLi.animate({top: this.offsetLeftTopList[index - this.col_count][1]}, 300);

        $(this.destination_li).data('y', $(this.destination_li).data('y') + 1);

        downLi.data('y', downLi.data('y') - 1);

        break;
      case 4:
        var index = $(this.destination_li).data('x') + ($(this.destination_li).data('y') - 1) * this.col_count;

        var upLi = $(this.ul_tag).find('li').eq(index);

        var prevThis = $(this.destination_li).prev();

        $(this.destination_li).insertAfter(upLi);

        upLi.insertAfter(prevThis);

        $(this.destination_li).animate({top: this.offsetLeftTopList[index][1]}, 300);

        upLi.animate({top: this.offsetLeftTopList[index + this.col_count][1]}, 300);

        $(this.destination_li).data('y', $(this.destination_li).data('y') - 1);

        upLi.data('y', upLi.data('y') + 1);

        break;
    }
  };
})();