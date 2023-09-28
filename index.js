(function(document) {
    'use strict';

    const inside = (obj, x, y) => (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height);

    class CanvImg {
        constructor(source, type) {
            this.type = type;
            this.image = new Image();
            this.image.src = source;
            this.image.onload = this.loadWH.bind(this);

            this.x = 0;
            this.y = 0;
            this.ratio = 0;

            this.focused = false;
            this.moving = false;
            this.resizing = false;

            this.resize = this.resize.bind(this);
        }

        addResizer(resizer) {
            this.resizer = resizer;
            this.resizer.addEventListener('input', this.resize);
        }

        resize(event) {
            const percent = parseInt(event.target.value) * .01;

            const newWidth = this.image.width * (percent);
            const newHeight = newWidth * this.ratio;

            this.width = newWidth;
            this.height = newHeight;
        }

        changeSource(source) {
            this.image.src = source;
            this.focused = true;
            this.resizer.value = 100;
        }

        loadWH() {
            this.width = this.image.width;
            this.height = this.image.height;
            this.ratio = this.height / this.width;

            if (this.width > 466) {
                this.width = 466;
                this.height = 466 * this.ratio;
            }

            if (this.height > 800) {
                this.height = 800;
                this.width = 800 * (this.image.width / this.image.height);
            }

            if (this.type == 'frame' || this.type == 'mask') {
                this.x = ((canvas.width / 2) - (this.width / 2)) - 4;
            }

            if (this.type == 'art') {
                this.x = 50;
                this.y = -60;
            }
        }

        setOffset(x, y) {
            this.offset = {
                x: x - this.x,
                y: y - this.y
            }
        }
    }

    class CanvDrawer {
        constructor(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');

            this.context.imageSmoothingEnabled = 'true';
            this.context.imageSmoothingQuality = 'high';

            this.compositer = document.createElement('canvas');
            this.cctx = this.compositer.getContext('2d');
            this.compositer.width = this.canvas.width;
            this.compositer.height = this.canvas.height;

            this.art = new CanvImg('img/ghost_rider.png', 'art');
            this.art2 = new CanvImg('#', 'art');
            this.mask = new CanvImg('img/art_mask.png', 'mask');
            this.frames = {
                common: new CanvImg('img/frame_common.png', 'frame'),
                uncommon: new CanvImg('img/frame_uncommon.png', 'frame'),
                rare: new CanvImg('img/frame_rare.png', 'frame'),
                epic: new CanvImg('img/frame_epic.png', 'frame'),
                legendary: new CanvImg('img/frame_legendary.png', 'frame'),
                ultra: new CanvImg('img/frame_ultra.png', 'frame'),
                infinite: new CanvImg('img/frame_infinite.png?v=2', 'frame'),
            }
            this.frame = this.frames.common;

            this.background = true;

            this.downpos = {x:0,y:0};

            this.draw = this.draw.bind(this);
            this.changeFrame = this.changeFrame.bind(this);
            this.downloadCard = this.downloadCard.bind(this);
            this.fileChange = this.fileChange.bind(this);
            for (let event of ['mousedown', 'mousemove', 'mouseup']) {
                this[event] = this[event].bind(this);
                this.canvas.addEventListener(event, this[event]);
            }

            this.canvas.addEventListener('touchstart', this.mousedown);
            this.canvas.addEventListener('touchmove', this.mousemove);
            this.canvas.addEventListener('touchend', this.mouseup);
        }

        mousedown(event) {
            let x, y;
            if (event.type === 'touchstart') {
                x = event.touches[0].clientX - canvas.offsetLeft;
                y = event.touches[0].clientY - canvas.offsetTop;
            } else {
                x = event.clientX - canvas.offsetLeft;
                y = event.clientY - canvas.offsetTop;
            }

            this.downpos = {x, y};

            if (inside(this.art2, x, y)) {
                event.stopPropagation();
                this.art2.moving = true;
                this.art2.setOffset(x, y);
                return;
            }

            if (inside(this.art, x, y)) {
                event.stopPropagation();
                this.art.moving = true;
                this.art.setOffset(x, y);
            }
        }

        mousemove(event) {
            let x, y;
            if (event.type === 'touchmove') {
                x = event.touches[0].clientX - canvas.offsetLeft;
                y = event.touches[0].clientY - canvas.offsetTop;
            } else {
                x = event.clientX - canvas.offsetLeft;
                y = event.clientY - canvas.offsetTop;
            }

            if (this.art.moving) {
                this.art.x = x - this.art.offset.x;
                this.art.y = y - this.art.offset.y;
            }
            if (this.art2.moving) {
                this.art2.x = x - this.art2.offset.x;
                this.art2.y = y - this.art2.offset.y;
            }
        }

        mouseup(event) {
            let x, y;
            if (event.type === 'touchmove') {
                x = event.touches[0].clientX - canvas.offsetLeft;
                y = event.touches[0].clientY - canvas.offsetTop;
            } else {
                x = event.clientX - canvas.offsetLeft;
                y = event.clientY - canvas.offsetTop;
            }

            if (this.art.moving) this.art.moving = false;
            if (this.art2.moving) this.art2.moving = false;
        }

        changeFrame(event) {
            const quality = event.target.value.toLowerCase();
            if (typeof this.frames[quality] !== 'undefined') {
                this.frame = this.frames[quality];
            }
        }

        setArt(source) {
            this.art.changeSource(source);
        }

        setArt2(source) {
            this.art2.changeSource(source);
            this.art2.x = this.art.x;
            this.art2.y = this.art.y;
            this.art2.width = this.art.width;
            this.art2.height = this.art.height;
        }

        get energy() {return document.querySelector('#energy-input').value}
        get power() {return document.querySelector('#power-input').value}
        get name() {return document.querySelector('#name-input').value}
        get description() {return document.querySelector('#desc-input').value}
        get font() {return document.querySelector('#font-input').value}
        get nameSize() {return document.querySelector('#name-size').value}
        get nameColor() {return document.querySelector('#name-color').value}

        draw(timestamp) {
            this.cctx.globalCompositeOperation = 'source-over';
            this.context.globalCompositeOperation = 'source-over';
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.cctx.clearRect(0, 0, this.compositer.width, this.compositer.height);

            if (this.background) {
                this.context.fillStyle = '#10072b';
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }


            this.cctx.drawImage(this.mask.image, this.mask.x, this.mask.y, this.mask.width, this.mask.height);
            this.cctx.globalCompositeOperation = 'source-in';
            this.cctx.drawImage(this.art.image, this.art.x, this.art.y, this.art.width, this.art.height);

            this.context.drawImage(this.compositer, 0, 0);
            this.context.drawImage(this.frame.image, this.frame.x, this.frame.y, this.frame.width, this.frame.height);

            // top layer, over frame
            const art2Src = this.art2.image.src;
            if (art2Src.substring(art2Src.length-1) !== '#') {
                this.context.drawImage(this.art2.image, this.art2.x, this.art2.y, this.art2.width, this.art2.height);
            }

            // text stuff
            this.context.textBaseline = 'middle';
            this.context.textAlign = 'center';
            this.context.font = '72px UltimatumBoldItalic';
            this.context.lineWidth = 11;
            this.context.fillStyle = '#FFFFFF';
            this.context.lineJoin = 'round';

            let numbersY = 60;
            // if(
            //     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            //     /Firefox/i.test(navigator.userAgent)
            // ) {
            //     numbersY = 35;
            // }

            // draw energy
            this.context.strokeStyle = '#231788';
            this.context.strokeText(this.energy, 105, numbersY);
            this.context.fillText(this.energy, 105, numbersY);

            // draw power
            this.context.strokeStyle = '#6a3318';
            this.context.strokeText(this.power, 437, numbersY);
            this.context.fillText(this.power, 437, numbersY);

            // draw name
            const name = this.name.toUpperCase().split('\n').reverse();
            this.context.font = `${this.nameSize}px ${this.font}`;
            this.context.strokeStyle = '#000000';
            this.context.fillStyle = this.nameColor;
            const nameY = numbersY + 465;
            for (let i = 0; i < name.length; i++) {
                this.context.strokeText(name[i], 268, nameY - (i * (this.nameSize * .75)));
                this.context.fillText(name[i], 268, nameY - (i * (this.nameSize * .75)));
            }

            // draw description
            const desc = this.description.split('\n');
            this.context.font = '20px HelveticaNeue';
            this.context.fillStyle = '#FFFFFF';
            this.context.lineWidth = 1;
            for (let i = 0; i < desc.length; i++) {
                this.context.strokeText(desc[i], 268, 600 + (i * 25));
                this.context.fillText(desc[i], 268, 600 + (i * 25));
            }

            requestAnimationFrame(this.draw);
        }

        addArtResizers(bottomResizer, topResizer) {
            this.art.addResizer(bottomResizer);
            this.art2.addResizer(topResizer);
        }

        fileChange(event) {
            const target = event.target;
            if (target.files && target.files[0]) {
                const label = target.nextElementSibling;
                label.textContent = `${label.getAttribute('data-label')} - ${target.files[0].name}`;

                const reader = new FileReader();
                if (target.id === 'bottom-layer') {
                    reader.onload = e => this.art.changeSource(e.target.result);
                } else if (target.id === 'top-layer') {
                    reader.onload = e => this.art2.changeSource(e.target.result);
                }

                reader.readAsDataURL(target.files[0]);
            }
        };

        downloadCard() {
            this.art.focused = false;
            setTimeout(() => {
                const link = document.createElement('a');
                link.setAttribute('download', `CustomCard-${this.name}.png`);
                link.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
                link.click();
            }, 250);
        }
    }

    function autoLineBreaker(event) {
        const target = event.target;
        const text = target.value;
        const lines = text.split('\n');

        if (lines[lines.length - 1].length >= 30) {
            if (target.value[target.value.length - 1] == ' ') {
                target.value += '\n';
            }
        }
    }

    const init = () => {
        const canvas = document.querySelector('#canvas');
        const drawer = new CanvDrawer(canvas);

        const bottomLayer = document.querySelector('#bottom-layer');
        const topLayer = document.querySelector('#top-layer');
        bottomLayer.addEventListener('change', drawer.fileChange);
        topLayer.addEventListener('change', drawer.fileChange);

        const bottomResizer = document.querySelector('#bottom-layer-size');
        const topResizer = document.querySelector('#top-layer-size');
        drawer.addArtResizers(bottomResizer, topResizer);

        const downloadButton = document.querySelector('#download-button');
        downloadButton.addEventListener('click', drawer.downloadCard);

        const descInput = document.querySelector('#desc-input');
        descInput.addEventListener('input', autoLineBreaker);

        const cardFrame = document.querySelector('#card-frame');
        cardFrame.addEventListener('change', drawer.changeFrame);

        const transparentBg = document.querySelector('#card-background');
        transparentBg.addEventListener('change', e => {
            console.log(!e.target.checked)
            drawer.background = !e.target.checked;
        });

        requestAnimationFrame(drawer.draw);
    };

    document.addEventListener('DOMContentLoaded', init);
})(document);
