/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var TAG_BASE = 2000;
var MAX_NODES = 1500;
var NODES_INCREASE = 50;
var s_nCurCase = 0;

////////////////////////////////////////////////////////
//
// NodeChildrenMenuLayer
//
////////////////////////////////////////////////////////
var NodeChildrenMenuLayer = PerformBasicLayer.extend({
    _maxCases:4,
    showCurrentTest:function () {
        var nodes = (this.getParent()).getQuantityOfNodes();
        var scene = null;
        switch (this._curCase) {
            case 0:
                scene = new IterateSpriteSheetCArray();
                break;
            case 1:
                scene = new AddSpriteSheet();
                break;
            case 2:
                scene = new RemoveSpriteSheet();
                break;
            case 3:
                scene = new ReorderSpriteSheet();
                break;
        }
        s_nCurCase = this._curCase;

        if (scene) {
            scene.initWithQuantityOfNodes(nodes);
            cc.Director.sharedDirector().replaceScene(scene);
        }
    }
});

////////////////////////////////////////////////////////
//
// NodeChildrenMainScene
//
////////////////////////////////////////////////////////
var NodeChildrenMainScene = cc.Scene.extend({
    _lastRenderedCount:null,
    _quantityOfNodes:null,
    _currentQuantityOfNodes:null,
    initWithQuantityOfNodes:function (nodes) {
        //srand(time());
        var s = cc.Director.sharedDirector().getWinSize();

        // Title
        var label = cc.LabelTTF.create(this.title(), "Arial", 40);
        this.addChild(label, 1);
        label.setPosition(cc.ccp(s.width / 2, s.height - 32));
        label.setColor(cc.ccc3(255, 255, 40));

        // Subtitle
        var strSubTitle = this.subtitle();
        if (strSubTitle.length) {
            var l = cc.LabelTTF.create(strSubTitle, "Thonburi", 16);
            this.addChild(l, 1);
            l.setPosition(cc.ccp(s.width / 2, s.height - 80));
        }

        this._lastRenderedCount = 0;
        this._currentQuantityOfNodes = 0;
        this._quantityOfNodes = nodes;

        cc.MenuItemFont.setFontSize(65);
        var that = this;
        var decrease = cc.MenuItemFont.create(" - ", this, this.onDecrease);
        decrease.setColor(cc.ccc3(0, 200, 20));
        var increase = cc.MenuItemFont.create(" + ", this, this.onIncrease);
        increase.setColor(cc.ccc3(0, 200, 20));

        var menu = cc.Menu.create(decrease, increase, null);
        menu.alignItemsHorizontally();
        menu.setPosition(cc.ccp(s.width / 2, s.height / 2 + 15));
        this.addChild(menu, 1);

        var infoLabel = cc.LabelTTF.create("0 nodes", "Marker Felt", 30);
        infoLabel.setColor(cc.ccc3(0, 200, 20));
        infoLabel.setPosition(cc.ccp(s.width / 2, s.height / 2 - 15));
        this.addChild(infoLabel, 1, TAG_INFO_LAYER);

        var menu = new NodeChildrenMenuLayer(true, 4, s_nCurCase);
        this.addChild(menu);

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    title:function () {
        return "No title";
    },
    subtitle:function () {
        return "";
    },
    updateQuantityOfNodes:function () {

    },
    onDecrease:function (sender) {
        this._quantityOfNodes -= NODES_INCREASE;
        if (this._quantityOfNodes < 0) {
            this._quantityOfNodes = 0;
        }

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    onIncrease:function (sender) {
        this._quantityOfNodes += NODES_INCREASE;
        if (this._quantityOfNodes > MAX_NODES) {
            this._quantityOfNodes = MAX_NODES
        }

        this.updateQuantityLabel();
        this.updateQuantityOfNodes();
    },
    updateQuantityLabel:function () {
        if (this._quantityOfNodes != this._lastRenderedCount) {
            var infoLabel = this.getChildByTag(TAG_INFO_LAYER);
            var str = this._quantityOfNodes + " nodes";
            infoLabel.setString(str);

            this._lastRenderedCount = this._quantityOfNodes;
        }
    },
    getQuantityOfNodes:function () {
        return this._quantityOfNodes;
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheet
//
////////////////////////////////////////////////////////
var IterateSpriteSheet = NodeChildrenMainScene.extend({
    _batchNode:null,
    _profilingTimer:null,
    ctor:function () {
        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = new cc.ProfilingTimer();
        }
    },
    updateQuantityOfNodes:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // increase nodes
        if (this._currentQuantityOfNodes < this._quantityOfNodes) {
            for (var i = 0; i < (this._quantityOfNodes - this._currentQuantityOfNodes); i++) {
                var sprite = cc.Sprite.createWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                this._batchNode.addChild(sprite);
                sprite.setPosition(cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height));
            }
        }

        // decrease nodes
        else if (this._currentQuantityOfNodes > this._quantityOfNodes) {
            for (var i = 0; i < (this._currentQuantityOfNodes - this._quantityOfNodes); i++) {
                var index = this._currentQuantityOfNodes - i - 1;
                this._batchNode.removeChildAtIndex(index, true);
            }
        }

        this._currentQuantityOfNodes = this._quantityOfNodes;
    },
    initWithQuantityOfNodes:function (nodes) {
        this._batchNode = cc.SpriteBatchNode.create("res/Images/spritesheet1.png");
        this.addChild(this._batchNode);

        this._super(nodes);

        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = cc.Profiler.timerWithName(this.profilerName(), this);
        }
        this.scheduleUpdate();
    },
    update:function (dt) {
    },
    profilerName:function () {
        return "none";
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheetFastEnum
//
////////////////////////////////////////////////////////
var IterateSpriteSheetFastEnum = IterateSpriteSheet.extend({
    update:function (dt) {
        // iterate using fast enumeration protocol
        var children = this._batchNode.getChildren();

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingBeginTimingBlock(this._profilingTimer);
        }

        for (var i = 0; i < children.length; i++) {
            var sprite = children[i];
            sprite.setVisible(false);
        }

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingEndTimingBlock(this._profilingTimer);
        }
    },

    title:function () {
        return "A - Iterate SpriteSheet";
    },
    subtitle:function () {
        return "Iterate children using Fast Enum API. See console";
    },
    profilerName:function () {
        return "iter fast enum";
    }
});

////////////////////////////////////////////////////////
//
// IterateSpriteSheetCArray
//
////////////////////////////////////////////////////////
var IterateSpriteSheetCArray = IterateSpriteSheet.extend({
    update:function (dt) {
        // iterate using fast enumeration protocol
        var children = this._batchNode.getChildren();

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingBeginTimingBlock(this._profilingTimer);
        }
        for (var i = 0; i < children.length; i++) {
            var sprite = children[i];
            sprite.setVisible(false);
        }

        if (cc.ENABLE_PROFILERS) {
            cc.ProfilingEndTimingBlock(this._profilingTimer);
        }
    },

    title:function () {
        return "B - Iterate SpriteSheet";
    },
    subtitle:function () {
        return "Iterate children using Array API. See console";
    },
    profilerName:function () {
        return "iter c-array";
    }
});

////////////////////////////////////////////////////////
//
// AddRemoveSpriteSheet
//
////////////////////////////////////////////////////////
var AddRemoveSpriteSheet = NodeChildrenMainScene.extend({
    _batchNode:null,
    ctor:function () {
        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = new cc.ProfilingTimer();
        }
    },
    updateQuantityOfNodes:function () {
        var s = cc.Director.sharedDirector().getWinSize();

        // increase nodes
        if (this._currentQuantityOfNodes < this._quantityOfNodes) {
            for (var i = 0; i < (this._quantityOfNodes - this._currentQuantityOfNodes); i++) {
                var sprite = cc.Sprite.createWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                this._batchNode.addChild(sprite);
                sprite.setPosition(cc.ccp(cc.RANDOM_0_1() * s.width, cc.RANDOM_0_1() * s.height));
                sprite.setVisible(false);
            }
        }
        // decrease nodes
        else if (this._currentQuantityOfNodes > this._quantityOfNodes) {
            for (var i = 0; i < (this._currentQuantityOfNodes - this._quantityOfNodes); i++) {
                var index = this._currentQuantityOfNodes - i - 1;
                this._batchNode.removeChildAtIndex(index, true);
            }
        }

        this._currentQuantityOfNodes = this._quantityOfNodes;
    },
    initWithQuantityOfNodes:function (nodes) {
        this._batchNode = cc.SpriteBatchNode.create("res/Images/spritesheet1.png");
        this.addChild(this._batchNode);

        this._super(nodes);

        if (cc.ENABLE_PROFILERS) {
            this._profilingTimer = cc.Profiler.timerWithName(this.profilerName(), this);
        }

        this.scheduleUpdate();
    },
    update:function (dt) {
    },
    profilerName:function () {
        return "none";
    }
});

////////////////////////////////////////////////////////
//
// AddSpriteSheet
//
////////////////////////////////////////////////////////
var AddSpriteSheet = AddRemoveSpriteSheet.extend({
        update:function (dt) {
            // reset seed
            //srandom(0);

            // 15 percent
            var totalToAdd = this._currentQuantityOfNodes * 0.15;

            if (totalToAdd > 0) {
                var sprites = [];
                var zs = [];

                // Don't include the sprite creation time and random as part of the profiling
                for (var i = 0; i < totalToAdd; i++) {
                    var sprite = cc.Sprite.createWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                    sprites.push(sprite);
                    zs[i] = cc.RANDOM_MINUS1_1() * 50;
                }

                // add them with random Z (very important!)
                if (cc.ENABLE_PROFILERS)
                    cc.ProfilingBeginTimingBlock(this._profilingTimer);
            }

            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.addChild(sprites[i], zs[i], TAG_BASE + i);
            }

            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingEndTimingBlock(this._profilingTimer);
            }

            // remove them
            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.removeChildByTag(TAG_BASE + i, true);
            }

            delete zs;

        },
        title:function () {
            return "C - Add to spritesheet";
        },
        subtitle:function () {
            return "Adds %10 of total sprites with random z. See console";
        },
        profilerName:function () {
            return "add sprites";
        }
    })
    ;

////////////////////////////////////////////////////////
//
// RemoveSpriteSheet
//
////////////////////////////////////////////////////////
var RemoveSpriteSheet = AddRemoveSpriteSheet.extend({
    update:function (dt) {
        //srandom(0);

        // 15 percent
        var totalToAdd = this._currentQuantityOfNodes * 0.15;

        if (totalToAdd > 0) {
            var sprites = [];

            // Don't include the sprite creation time as part of the profiling
            for (var i = 0; i < totalToAdd; i++) {
                var sprite = cc.Sprite.createWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                sprites.push(sprite);
            }

            // add them with random Z (very important!)
            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.addChild(sprites[i], cc.RANDOM_MINUS1_1() * 50, TAG_BASE + i);
            }

            // remove them
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingBeginTimingBlock(this._profilingTimer);
            }

            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.removeChildByTag(TAG_BASE + i, true);
            }

            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingEndTimingBlock(this._profilingTimer);
            }
        }
    },
    title:function () {
        return "D - Del from spritesheet";
    },
    subtitle:function () {
        return "Remove %10 of total sprites placed randomly. See console";
    },
    profilerName:function () {
        return "remove sprites";
    }
});

////////////////////////////////////////////////////////
//
// ReorderSpriteSheet
//
////////////////////////////////////////////////////////
var ReorderSpriteSheet = AddRemoveSpriteSheet.extend({

    update:function (dt) {
        //srandom(0);

        // 15 percent
        var totalToAdd = this._currentQuantityOfNodes * 0.15;

        if (totalToAdd > 0) {
            var sprites = [];

            // Don't include the sprite creation time as part of the profiling
            for (var i = 0; i < totalToAdd; i++) {
                var sprite = cc.Sprite.createWithTexture(this._batchNode.getTexture(), cc.RectMake(0, 0, 32, 32));
                sprites.push(sprite);
            }

            // add them with random Z (very important!)
            for (var i = 0; i < totalToAdd; i++) {
                this._batchNode.addChild(sprites[i], cc.RANDOM_MINUS1_1() * 50, TAG_BASE + i);
            }

            //		[this._batchNode sortAllChildren];

            // reorder them
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingBeginTimingBlock(this._profilingTimer);
            }

            for (var i = 0; i < totalToAdd; i++) {
                var node = this._batchNode.getChildren()[i];
                ;
                this._batchNode.reorderChild(node, cc.RANDOM_MINUS1_1() * 50);
            }
            if (cc.ENABLE_PROFILERS) {
                cc.ProfilingEndTimingBlock(this._profilingTimer);
            }
        }


        // remove them
        for (var i = 0; i < totalToAdd; i++) {
            this._batchNode.removeChildByTag(TAG_BASE + i, true);
        }

    },

    title:function () {
        return "E - Reorder from spritesheet";
    },
    subtitle:function () {
        return "Reorder %10 of total sprites placed randomly. See console";
    },
    profilerName:function () {
        return "reorder sprites";
    }
});

function runNodeChildrenTest() {
    var scene = new IterateSpriteSheetCArray();
    scene.initWithQuantityOfNodes(NODES_INCREASE);
    cc.Director.sharedDirector().replaceScene(scene);
}