/**
* 『✡𝐙𝐇𝐄𝐍𝐒𝐇𝐀𝐍𝐆𝐘𝐈𝐍 - 枕上瘾』
* 『✡愿你的代码如枕般丝滑、无 bug 相伴 - May your code be as smooth as a pillow and bug-free』
*/
class ZhenshangyinSmoothScroll {
    constructor(options) {
        this.options = {
            damping: 0.1,
            scrollMultiplier: 2,
            preventScrollOn: null,
            ...options,
        };

        this._viewerSelectors = [
            '.zhenshangyin-image-viewer'
        ].join(', ');

        this.currentScroll = this.getScrollPosition();
        this.targetScroll = this.getScrollPosition();
        this.isScrolling = false;
        this.animationFrame = null;

        this.handleWheel = this.handleWheel.bind(this);
        this.animateScroll = this.animateScroll.bind(this);

        this.enable();
    }

    getScrollPosition() {
        return window.pageYOffset;
    }

    setScrollPosition(position) {
        window.scrollTo(0, position);
    }

    getMaxScroll() {
        return document.documentElement.scrollHeight - window.innerHeight;
    }

    _findScrollableAncestor(target, deltaY) {
        let node = target;
        while (node && node !== document.documentElement && node !== document.body) {
            if (node instanceof HTMLElement) {
                const style = window.getComputedStyle(node);
                const overflowY = style.overflowY;
                const canScrollY = node.scrollHeight > node.clientHeight;
                const overflowAllowsScroll = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
                if (overflowAllowsScroll && canScrollY) {
                    const atTop = node.scrollTop <= 0;
                    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
                    if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
                        return node;
                    }
                }
            }
            node = node.parentNode;
        }
        return null;
    }

    handleWheel(e) {
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) {
            return;
        }

        const targetElement = e.target instanceof Element ? e.target : null;

        if (this.options.preventScrollOn && targetElement && targetElement.closest(this.options.preventScrollOn)) {
            return;
        }

        if (this._viewerSelectors && targetElement && targetElement.closest(this._viewerSelectors)) {
            e.preventDefault();
            return;
        }

        if (this._findScrollableAncestor(e.target, e.deltaY)) {
            return;
        }

        e.preventDefault();

        if (!this.isScrolling) {
            const currentPosition = this.getScrollPosition();
            this.currentScroll = currentPosition;
            this.targetScroll = currentPosition;
        }

        this.targetScroll += e.deltaY * this.options.scrollMultiplier;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, this.getMaxScroll()));

        if (!this.isScrolling) {
            this.startAnimation();
        }
    }

    lerp(start, end, amount) {
        return (1 - amount) * start + amount * end;
    }

    startAnimation() {
        if (!this.isScrolling) {
            this.isScrolling = true;
            this.animationFrame = requestAnimationFrame(this.animateScroll);
        }
    }

    animateScroll() {
        if (!this.isScrolling) return;

        const damping = this.options.damping;
        const snapThreshold = 0.5;

        this.currentScroll = this.lerp(this.currentScroll, this.targetScroll, damping);

        if (Math.abs(this.currentScroll - this.targetScroll) < snapThreshold) {
            this.currentScroll = this.targetScroll;
            this.isScrolling = false;
        }

        this.setScrollPosition(this.currentScroll);

        if (this.isScrolling) {
            this.animationFrame = requestAnimationFrame(this.animateScroll);
        }
    }

    enable() {
        window.addEventListener('wheel', this.handleWheel, { passive: false });
    }

    disable() {
        window.removeEventListener('wheel', this.handleWheel);
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isScrolling = false;
    }

    destroy() {
        this.disable();
    }
}

class ZhenshangyinScrollAnimate {
    constructor(options = {}) {
        this.config = {
            threshold: options.threshold || 100,
            duration: options.duration || 800,
            delay: options.delay || 0,
            repeat: options.repeat || false,
            easing: options.easing || 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            mobile: options.mobile || false,
            distance: options.distance || 15,
            startOpacity: options.startOpacity !== undefined ? options.startOpacity : 0,
            endOpacity: options.endOpacity !== undefined ? options.endOpacity : 1,
            startScale: options.startScale || 0.5,
            endScale: options.endScale || 1,
            startScaleOut: options.startScaleOut || 1.5,
            use3D: options.use3D !== undefined ? options.use3D : true
        };

        this.elements = [];
        this.animatedElements = new WeakSet();
        this.elementInitialPositions = new WeakMap();
        this.elementOriginalTransforms = new WeakMap();
        this.groupParents = new WeakMap();
        this.groupElements = new WeakMap();
        this.elementOriginalStyles = new WeakMap();
        this.elementRows = new WeakMap();
        this.pendingGroupAnimations = new WeakMap();

        this.scheduledAnimations = new WeakSet();
        this.scheduledTimeoutIds = new WeakMap();
        this.activeTimeoutIds = new Set();
        this.ticking = false;
        this.scrollHandler = this.debounce(this.handleScroll.bind(this), 10);
        this.boundOnScroll = this.onScroll.bind(this);
        this.boundOnObserver = this.onIntersect.bind(this);
        this.observer = null;
        this.useObserver = false;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (!this.config.mobile && this.isMobile()) {
            document.querySelectorAll('[data-zhenshangyin]').forEach(el => {
                el.style.visibility = 'visible';
            });
            return;
        }

        this.elements = Array.from(document.querySelectorAll('[data-zhenshangyin]'));

        const groupParents = this.elements.filter(el => el.hasAttribute('data-group'));
        groupParents.forEach(parent => {
            const selector = parent.getAttribute('data-group');
            const children = Array.from(parent.querySelectorAll(selector));

            if (children.length) {
                this.groupParents.set(parent, true);

                this.storeOriginalStyles(parent);
                children.forEach(child => {
                    this.storeOriginalStyles(child);
                });

                this.storeInitialPosition(parent);
                children.forEach(child => {
                    this.storeInitialPosition(child);
                });

                let processedChildren = [...children];
                if (parent.hasAttribute('data-random')) {
                    processedChildren = this.shuffleArray([...children]);
                }

                this.groupElements.set(parent, processedChildren);
                this.pendingGroupAnimations.set(parent, new Set(processedChildren));
                this.setupGroupElements(parent, processedChildren);

                children.forEach(child => {
                    const index = this.elements.indexOf(child);
                    if (index > -1) {
                        this.elements.splice(index, 1);
                    }
                });
            }
        });

        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                this.storeOriginalStyles(element);
                this.storeInitialPosition(element);
                this.setInitialStyles(element);
            }
        });

        this.useObserver = !this.config.repeat && typeof IntersectionObserver !== 'undefined';

        if (this.useObserver) {
            this.setupObserver();
        } else {
            window.addEventListener('scroll', this.boundOnScroll, { passive: true });
            window.addEventListener('resize', this.boundOnScroll, { passive: true });
        }

        if (!this.useObserver) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.handleInitialAnimation();
                });
            });
        }
    }

    setupObserver() {
        const t = this.config.threshold || 0;
        const rootMargin = `-${t}px 0px -${t}px 0px`;
        this.observer = new IntersectionObserver(this.boundOnObserver, {
            root: null,
            rootMargin,
            threshold: 0
        });

        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }

    onIntersect(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;

            if (this.groupParents.has(element)) {
                const children = this.groupElements.get(element);
                if (!children || !children.length) return;
                if (!this.animatedElements.has(element)) {
                    this.animateGroupByRows(element, children);
                }
                return;
            }

            const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
            this.scheduleAnimation(element, delay, () => {
                const type = element.getAttribute('data-zhenshangyin');
                this.animateElement(element, type, this.config.duration);
            });
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        window.removeEventListener('scroll', this.boundOnScroll);
        window.removeEventListener('resize', this.boundOnScroll);

        this.activeTimeoutIds.forEach(id => {
            clearTimeout(id);
        });
        this.activeTimeoutIds.clear();
    }

    onScroll() {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            this.ticking = false;
            this.handleScroll();
        });
    }

    onResize() {
        if (this.resizeTicking) return;
        this.resizeTicking = true;
        requestAnimationFrame(() => {
            this.resizeTicking = false;
            this.refresh();
            if (!this.useObserver) {
                this.handleScroll();
            }
        });
    }

    refresh() {
        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                this.storeInitialPosition(element);
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent)) {
                this.storeInitialPosition(parent);
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                children.forEach(child => {
                    this.storeInitialPosition(child);
                });

                const rowMap = new Map();
                children.forEach(child => {
                    const rect = child.getBoundingClientRect();
                    const rowKey = Math.round(rect.top);
                    if (!rowMap.has(rowKey)) {
                        rowMap.set(rowKey, []);
                    }
                    rowMap.get(rowKey).push(child);
                });

                const sortedRows = Array.from(rowMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([_, elements]) => elements);

                this.elementRows.set(parent, sortedRows);
            }
        });

        if (this.useObserver && this.observer) {
            this.observer.disconnect();
            this.observer = null;
            this.setupObserver();
        }
    }

    onResize() {
        if (this.resizeTicking) return;
        this.resizeTicking = true;
        requestAnimationFrame(() => {
            this.resizeTicking = false;
            this.refresh();
            if (!this.useObserver) {
                this.handleScroll();
            }
        });
    }

    refresh() {
        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                this.storeInitialPosition(element);
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent)) {
                this.storeInitialPosition(parent);
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                children.forEach(child => {
                    this.storeInitialPosition(child);
                });

                const rowMap = new Map();
                children.forEach(child => {
                    const rect = child.getBoundingClientRect();
                    const rowKey = Math.round(rect.top);
                    if (!rowMap.has(rowKey)) {
                        rowMap.set(rowKey, []);
                    }
                    rowMap.get(rowKey).push(child);
                });

                const sortedRows = Array.from(rowMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([_, elements]) => elements);

                this.elementRows.set(parent, sortedRows);
            }
        });

        if (this.useObserver && this.observer) {
            this.observer.disconnect();
            this.observer = null;
            this.setupObserver();
        }
    }

    handleInitialAnimation() {
        this.elements.forEach(element => {
            if (!this.groupParents.has(element) && this.isElementInView(element)) {
                const type = element.getAttribute('data-zhenshangyin');
                const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
                const duration = parseInt(element.getAttribute('data-duration') || this.config.duration);

                this.scheduleAnimation(element, delay, () => {
                    this.animateElement(element, type, duration);
                });
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent) && this.isElementInView(parent)) {
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                const type = parent.getAttribute('data-zhenshangyin');
                const nextTrigger = parseFloat(parent.getAttribute('data-next-trigger') || 0.2);
                const baseDelay = parseInt(parent.getAttribute('data-delay') || this.config.delay);

                if (parent.hasAttribute('data-random')) {
                    const visibleChildren = children.filter(element => this.isElementInView(element));
                    if (visibleChildren.length === 0) return;

                    const shuffledChildren = this.shuffleArray(visibleChildren);

                    shuffledChildren.forEach((element, index) => {
                        const delay = baseDelay + (index * nextTrigger * 1000);
                        const duration = parseInt(element.getAttribute('data-duration') || this.config.duration);

                        this.scheduleAnimation(element, delay, () => {
                            const pendingElements = this.pendingGroupAnimations.get(parent);
                            if (pendingElements && !pendingElements.has(element)) return;
                            this.animateElement(element, type, duration);
                            this.updatePendingElements(parent, element);
                        });
                    });
                } else {
                    const rows = this.elementRows.get(parent) || [];
                    let cumulativeDelay = baseDelay;

                    rows.forEach((rowElements) => {
                        const hasVisibleElement = rowElements.some(element => this.isElementInView(element));

                        if (hasVisibleElement) {
                            rowElements.forEach((element, elementIndex) => {
                                const delay = cumulativeDelay + (elementIndex * nextTrigger * 1000);
                                const duration = parseInt(element.getAttribute('data-duration') || this.config.duration);

                                this.scheduleAnimation(element, delay, () => {
                                    const pendingElements = this.pendingGroupAnimations.get(parent);
                                    if (pendingElements && !pendingElements.has(element)) return;
                                    this.animateElement(element, type, duration);
                                    this.updatePendingElements(parent, element);
                                });
                            });

                            cumulativeDelay += (rowElements.length * nextTrigger * 1000) + 100;
                        }
                    });
                }
            }
        });
    }

    handleScroll() {
        if (this.config.repeat) {
            this.elements.forEach(element => {
                if (!this.groupParents.has(element) &&
                    this.animatedElements.has(element) &&
                    this.isElementCompletelyOutOfView(element)) {
                    this.resetElement(element);
                }
            });

            this.elements.forEach(parent => {
                if (this.groupParents.has(parent)) {
                    const children = this.groupElements.get(parent);
                    if (!children || !children.length) return;

                    children.forEach(child => {
                        if (this.animatedElements.has(child) && this.isElementCompletelyOutOfView(child)) {
                            const type = parent.getAttribute('data-zhenshangyin');
                            this.resetElement(child, type);

                            const pendingElements = this.pendingGroupAnimations.get(parent);
                            if (pendingElements) {
                                pendingElements.add(child);
                            } else {
                                this.pendingGroupAnimations.set(parent, new Set([child]));
                            }
                        }
                    });

                    const pendingElements = this.pendingGroupAnimations.get(parent);
                    if (pendingElements && pendingElements.size === children.length) {
                        this.animatedElements.delete(parent);
                    }
                }
            });
        }

        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                if (this.isElementInView(element)) {
                    const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
                    this.scheduleAnimation(element, delay, () => {
                        const type = element.getAttribute('data-zhenshangyin');
                        this.animateElement(element, type, this.config.duration);
                    });
                }
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent)) {
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                if (this.isElementInView(parent)) {
                    if (!this.animatedElements.has(parent)) {
                        this.animateGroupByRows(parent, children);
                    }
                }
            }
        });
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    storeOriginalStyles(element) {
        this.elementOriginalStyles.set(element, {
            visibility: element.style.visibility,
            opacity: element.style.opacity,
            transform: element.style.transform,
            transition: element.style.transition,
            willChange: element.style.willChange,
            backfaceVisibility: element.style.backfaceVisibility
        });

        const originalTransform = window.getComputedStyle(element).transform;
        this.elementOriginalTransforms.set(element, originalTransform === 'none' ? '' : originalTransform);
    }

    storeInitialPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        this.elementInitialPositions.set(element, {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            left: rect.left,
            right: rect.right,
            height: rect.height
        });
    }

    setInitialStyles(element) {
        const animationType = element.getAttribute('data-zhenshangyin');
        const duration = element.getAttribute('data-duration') || this.config.duration;
        const delay = element.getAttribute('data-delay') || this.config.delay;

        element.style.visibility = 'visible';
        element.style.transition = 'none';
        element.style.opacity = String(this.config.startOpacity);

        if (this.config.use3D) {
            element.style.transform = this.getCombinedTransform(element, this.getInitialTransform(animationType));
            element.style.willChange = 'transform, opacity';
            element.style.backfaceVisibility = 'hidden';
        }

        void element.offsetHeight;

        element.style.transition = `opacity ${duration}ms ${this.config.easing} ${delay}ms, transform ${duration}ms ${this.config.easing} ${delay}ms`;
    }

    setupGroupElements(parent, children) {
        const animationType = parent.getAttribute('data-zhenshangyin');

        const rowMap = new Map();
        children.forEach(element => {
            const rect = element.getBoundingClientRect();
            const rowKey = Math.round(rect.top);
            if (!rowMap.has(rowKey)) {
                rowMap.set(rowKey, []);
            }
            rowMap.get(rowKey).push(element);
        });

        const sortedRows = Array.from(rowMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([_, elements]) => {
                return elements.sort((a, b) =>
                    children.indexOf(a) - children.indexOf(b)
                );
            });

        this.elementRows.set(parent, sortedRows);

        children.forEach(element => {
            element.style.transition = 'none';
            element.style.opacity = String(this.config.startOpacity);
            element.style.visibility = 'visible';

            if (this.config.use3D) {
                element.style.transform = this.getCombinedTransform(element, this.getInitialTransform(animationType));
                element.style.willChange = 'transform, opacity';
                element.style.backfaceVisibility = 'hidden';
            }

            void element.offsetHeight;

            const baseDuration = parent.getAttribute('data-duration') || this.config.duration;
            const duration = element.getAttribute('data-duration') || baseDuration;

            element.style.transition = `opacity ${duration}ms ${this.config.easing}, transform ${duration}ms ${this.config.easing}`;
        });
    }

    getCombinedTransform(element, newTransform) {
        const originalTransform = this.elementOriginalTransforms.get(element) || '';
        return originalTransform ? `${originalTransform} ${newTransform}` : newTransform;
    }

    getInitialTransform(type) {
        const { distance, startScale, startScaleOut } = this.config;

        switch (type) {
            case 'slideUp':
                return `translate3d(0, ${distance}px, 0)`;
            case 'slideDown':
                return `translate3d(0, -${distance}px, 0)`;
            case 'slideLeft':
                return `translate3d(${distance}px, 0, 0)`;
            case 'slideRight':
                return `translate3d(-${distance}px, 0, 0)`;
            case 'zoomIn':
                return `scale3d(${startScale}, ${startScale}, ${startScale})`;
            case 'zoomOut':
                return `scale3d(${startScaleOut}, ${startScaleOut}, ${startScaleOut})`;
            case 'flipInX':
                return 'rotateX(90deg)';
            case 'flipInY':
                return 'rotateY(90deg)';
            case 'fadeIn':
            default:
                return 'translate3d(0, 0, 0)';
        }
    }

    getFinalTransform(type) {
        const { endScale } = this.config;

        switch (type) {
            case 'zoomIn':
            case 'zoomOut':
                return `scale3d(${endScale}, ${endScale}, ${endScale})`;
            default:
                return '';
        }
    }

    isElementInView(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const threshold = this.config.threshold;

        return (rect.top <= windowHeight - threshold && rect.bottom >= threshold);
    }

    isElementCompletelyOutOfView(element) {
        const initialPosition = this.elementInitialPositions.get(element);
        if (!initialPosition) return true;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return (
            initialPosition.bottom < scrollTop ||
            initialPosition.top > scrollTop + windowHeight
        );
    }

    animateElement(element, type, duration) {
        requestAnimationFrame(() => {
            element.style.opacity = this.config.endOpacity;
            const finalTransform = this.getFinalTransform(type);
            element.style.transform = finalTransform ?
                this.getCombinedTransform(element, finalTransform) :
                this.elementOriginalTransforms.get(element) || '';

            this.animatedElements.add(element);

            setTimeout(() => {
                this.cleanupAnimationProperties(element);
            }, duration);
        });
    }

    updatePendingElements(parent, element) {
        const pendingElements = this.pendingGroupAnimations.get(parent);
        if (pendingElements) {
            pendingElements.delete(element);

            if (pendingElements.size === 0) {
                this.animatedElements.add(parent);
            }
        }
    }

    animateGroupByRows(parent, children) {
        if (!children || !children.length) return;

        if (!this.pendingGroupAnimations.has(parent)) {
            this.pendingGroupAnimations.set(parent, new Set(children));
            this.setupGroupElements(parent, children);
        }

        const type = parent.getAttribute('data-zhenshangyin');
        const nextTrigger = parseFloat(parent.getAttribute('data-next-trigger') || 0.2);
        const baseDelay = parseInt(parent.getAttribute('data-delay') || this.config.delay);
        const rows = this.elementRows.get(parent) || [];

        rows.forEach(rowElements => {
            const visibleElements = rowElements.filter(element => this.isElementInView(element));

            if (visibleElements.length > 0) {
                const firstVisibleIdx = rowElements.findIndex(el => visibleElements.includes(el));
                if (firstVisibleIdx === -1) return;

                const reorderedRow = [
                    ...rowElements.slice(firstVisibleIdx),
                    ...rowElements.slice(0, firstVisibleIdx)
                ];

                reorderedRow.forEach((element, indexInRow) => {
                    const pendingElements = this.pendingGroupAnimations.get(parent);
                    if (pendingElements && pendingElements.has(element)) {
                        const elementDelay = element.getAttribute('data-delay');
                        const delay = elementDelay !== null ?
                            parseInt(elementDelay) :
                            baseDelay + (indexInRow * nextTrigger * 1000);

                        const duration = element.getAttribute('data-duration') || this.config.duration;

                        this.scheduleAnimation(element, delay, () => {
                            const stillPending = this.pendingGroupAnimations.get(parent);
                            if (stillPending && !stillPending.has(element)) return;
                            this.animateElement(element, type, duration);
                            this.updatePendingElements(parent, element);
                        });
                    }
                });
            }
        });
    }

    resetElement(element, type) {
        const animationType = type || element.getAttribute('data-zhenshangyin');

        element.style.transition = 'none';
        element.style.opacity = this.config.startOpacity;
        element.style.transform = this.getCombinedTransform(element, this.getInitialTransform(animationType));

        void element.offsetHeight;

        const duration = element.getAttribute('data-duration') || this.config.duration;
        const delay = element.getAttribute('data-delay') || this.config.delay;
        element.style.transition = `opacity ${duration}ms ${this.config.easing} ${delay}ms, transform ${duration}ms ${this.config.easing} ${delay}ms`;

        this.animatedElements.delete(element);
        this.cancelScheduledAnimation(element);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    cleanupAnimationProperties(element) {
        if (this.animatedElements.has(element)) {
            const originalStyles = this.elementOriginalStyles.get(element);
            if (!originalStyles) return;

            element.style.visibility = originalStyles.visibility;
            element.style.opacity = originalStyles.opacity;
            element.style.transform = originalStyles.transform;
            element.style.transition = originalStyles.transition;
            element.style.willChange = originalStyles.willChange;
            element.style.backfaceVisibility = originalStyles.backfaceVisibility;
        }
    }

    scheduleAnimation(element, delay, callback) {
        if (this.animatedElements.has(element) || this.scheduledAnimations.has(element)) return;

        this.cancelScheduledAnimation(element);
        this.scheduledAnimations.add(element);

        const tid = setTimeout(() => {
            this.activeTimeoutIds.delete(tid);
            this.scheduledTimeoutIds.delete(element);
            this.scheduledAnimations.delete(element);

            if (this.animatedElements.has(element)) return;
            callback();
        }, delay);

        this.scheduledTimeoutIds.set(element, tid);
        this.activeTimeoutIds.add(tid);
    }

    cancelScheduledAnimation(element) {
        this.scheduledAnimations.delete(element);
        const tid = this.scheduledTimeoutIds.get(element);
        if (tid) {
            clearTimeout(tid);
            this.activeTimeoutIds.delete(tid);
            this.scheduledTimeoutIds.delete(element);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

class ZhenshangyinSwiper {
    static linkedGroups = new Map();

    static addToLinkedGroup(swiper, groupId) {
        if (!groupId) return;

        if (!this.linkedGroups.has(groupId)) {
            this.linkedGroups.set(groupId, []);
        }
        this.linkedGroups.get(groupId).push(swiper);
    }

    static removeFromLinkedGroup(swiper, groupId) {
        if (!groupId || !this.linkedGroups.has(groupId)) return;

        const group = this.linkedGroups.get(groupId);
        const index = group.indexOf(swiper);
        if (index > -1) {
            group.splice(index, 1);
        }

        if (group.length === 0) {
            this.linkedGroups.delete(groupId);
        }
    }

    static notifyLinkedGroupChange(activeIndex, sourceSwiper, groupId) {
        if (!groupId || !this.linkedGroups.has(groupId)) return;

        const group = this.linkedGroups.get(groupId);
        group.forEach(swiper => {
            if (swiper !== sourceSwiper && swiper.isTransitioning !== true) {
                if (sourceSwiper && sourceSwiper._pendingAutoplayReset) {
                    swiper._pendingAutoplayReset = true;
                }
                if (sourceSwiper && sourceSwiper._preserveWindowStart) {
                    swiper._preserveWindowStart = true;
                }
                swiper._isLinkedSyncing = true;
                swiper.slideTo(activeIndex, false);
                swiper._isLinkedSyncing = false;
            }
        });
    }

    constructor(container, options = {}) {
        const containerElement = typeof container === 'string' ? document.querySelector(container) : container;
        if (!containerElement) {
            this.initialized = false;
            this.slides = [];
            this.wrapper = null;
            this.container = null;
            this.options = { transforms: { enabled: false } };
            return this;
        }

        const defaultTransforms = {
            scale: {
                enabled: false,
                step: 0.1
            },
            translate: {
                enabled: false,
                x: 0,
                y: 0,
                z: 0
            },
            rotate: {
                enabled: false,
                x: 0,
                y: 0,
                z: 0
            },
            skew: {
                enabled: false,
                x: 0,
                y: 0
            },
            perspective: {
                enabled: false,
                value: 1500
            },
            backfaceVisibility: {
                enabled: false,
                value: 'hidden'
            },
            opacity: {
                enabled: false,
                step: 0.1
            },
            filter: {
                enabled: false,
                blur: 0,
                brightness: 0,
                contrast: 0,
                grayscale: 0,
                hueRotate: 0,
                invert: 0,
                saturate: 0,
                sepia: 0
            },
            uniformSpacing: {
                enabled: false,
                gap: 20,
                customSpacing: null
            },
        };

        if (options.breakpoints) {
            Object.keys(options.breakpoints).forEach(breakpoint => {
                if (options.breakpoints[breakpoint].transforms) {
                    options.breakpoints[breakpoint].transforms = {
                        ...defaultTransforms,
                        ...options.breakpoints[breakpoint].transforms
                    };
                }
            });
        }

        options.transforms = Object.assign(
            defaultTransforms,
            options.transforms || {}
        );

        this.originalTransforms = { ...options.transforms };

        options.on = options.on || {};
        const originalTouchStart = options.on.touchStart;
        const originalTouchMove = options.on.touchMove;
        const originalTouchEnd = options.on.touchEnd;

        options.on.touchStart = (swiper, event, touchData) => {
            if (swiper.options.transforms && swiper.isTransformsEnabled()) {
                swiper._transformTouchData = {
                    initialTransforms: swiper.slides.map(slide => slide.style.transform),
                    touchStartIndex: swiper.currentIndex
                };
            }
            if (originalTouchStart) {
                originalTouchStart.call(this, swiper, event, touchData);
            }
        };

        options.on.touchMove = (swiper, event, touchData) => {
            if (swiper.options.transforms && swiper.isTransformsEnabled() && swiper.isMoved && !swiper.isAnimating) {
                swiper.updateTransformsDuringTouch(touchData);
            }
            if (originalTouchMove) {
                originalTouchMove.call(this, swiper, event, touchData);
            }
        };

        options.on.touchEnd = (swiper, event, touchData) => {
            if (swiper.options.transforms && swiper.isTransformsEnabled()) {
                setTimeout(() => {
                    swiper.updateTransforms();
                }, 10);
            }
            if (originalTouchEnd) {
                originalTouchEnd.call(this, swiper, event, touchData);
            }
        };

        const containers = typeof container === 'string'
            ? document.querySelectorAll(container)
            : [container];

        if (containers.length === 1) {
            this.container = containers[0];
            if (!this.container) {
                return;
            }
            this.options = {
                autoplay: options.autoplay || false,
                interval: options.interval || 3000,
                speed: options.speed || 500,
                direction: options.direction || 'horizontal',
                loop: options.loop !== undefined ? options.loop : false,
                grid: options.grid || null,
                gridColumnGap: options.gridColumnGap,
                magnifier: options.magnifier !== undefined ? options.magnifier : false,
                fixedMagnifierSize: options.fixedMagnifierSize || 400,
                showSelectionBox: options.showSelectionBox !== undefined ? options.showSelectionBox : true,
                selectionBoxSize: options.selectionBoxSize || 100,
                magnifierMargin: options.magnifierMargin || 10,
                zoomRatio: options.zoomRatio || 2.5,
                pauseOnMouseEnter: options.pauseOnMouseEnter !== undefined ? options.pauseOnMouseEnter : false,
                pausedTime: 0,
                lastPauseTime: 0,
                pagination: options.pagination || {},
                navigation: {
                    prevEl: options.navigation?.prevEl || null,
                    nextEl: options.navigation?.nextEl || null
                },
                mousewheel: options.mousewheel !== undefined ? options.mousewheel : false,
                keyboard: options.keyboard !== undefined ? options.keyboard : false,
                touchable: options.touchable !== undefined ? options.touchable : false,
                slidesPerView: options.slidesPerView || 1,
                spaceBetween: options.spaceBetween || 0,
                slidesPerGroup: options.slidesPerGroup || 1,
                centeredSlides: options.centeredSlides !== undefined ? options.centeredSlides : false,
                breakpoints: options.breakpoints || {},
                effect: options.effect || 'slide',
                perspective: options.perspective !== undefined ? options.perspective : 1500,
                linkedGroup: options.linkedGroup || null,
                clickToSlide: options.clickToSlide !== undefined ? options.clickToSlide : true,
                ...options
            };

            this.manuallyPaused = false;
            this.isMouseOver = false;
            this.currentIndex = 0;
            this.slides = [];
            this.autoplayTimer = null;
            this.resizeObserver = null;
            this.containerWidth = 0;
            this.containerHeight = 0;
            this.currentBreakpoint = null;
            this.originalOptions = { ...this.options };
            this.touchStartTime = 0;
            this.touchEndTime = 0;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchMoveX = 0;
            this.touchMoveY = 0;
            this.touchDiffX = 0;
            this.touchDiffY = 0;
            this.touchesDirection = null;
            this.isTouched = false;
            this.isMoved = false;
            this.velocity = 0;
            this.allowClick = true;
            this.swipeDirection = null;
            this.isScrolling = false;
            this.touchStartTranslate = 0;
            this.currentTranslate = 0;
            this.maxTranslate = 0;
            this.minTranslate = 0;
            this.isAnimatingRAF = false;
            this.rafId = null;
            this.latestTranslate = 0;
            this._isClicking = false;
            this._transformsInitialized = false;

            this.init();
        } else {
            const swipers = Array.from(containers).map(container => {
                return new ZhenshangyinSwiper(container, { ...options });
            });

            return swipers.length === 1 ? swipers[0] : swipers;
        }
    }
    init() {

        this.container.classList.add('zhenshangyin-component');
        try {
            this.container.style.minWidth = '0px';
            this.container.style.minHeight = '0px';
        } catch (_) { }
        if (this.options.perspective || this.options.perspective === 0) {
            this.container.style.perspective = typeof this.options.perspective === 'number'
                ? `${this.options.perspective}px`
                : this.options.perspective;
        } else if (this.options.perspective === false) {
            this.container.style.perspective = 'none';
        }
        this.container.classList.add(`zhenshangyin-${this.options.direction}`);
        if (this.options.effect === 'fade') {
            this.container.classList.add('zhenshangyin-fade');
        }
        this.wrapper = this.container.querySelector('.zhenshangyin-wrap');
        try {
            if (this.wrapper) {
                this.wrapper.style.minWidth = '0px';
                this.wrapper.style.minHeight = '0px';
            }
        } catch (_) { }
        this.slides = Array.from(this.wrapper.children);
        this.slides.forEach(slide => {
            slide.classList.add('zhenshangyin-slide');
        });

        if (!this._originalSlides || !this._originalSlides.length) {
            this._originalSlides = this.slides.map(slide => slide.cloneNode(true));
        }

        try {
            this.wrapper.style.willChange = 'transform';
            if (this.options.effect === 'fade') {
                this.slides.forEach(slide => {
                    slide.style.willChange = 'opacity, transform';
                });
            }
            if (this.options.direction === 'horizontal') {
                this.container.style.touchAction = 'pan-y pinch-zoom';
            } else {
                this.container.style.touchAction = 'pan-x pinch-zoom';
            }
        } catch (_) { }

        if (!this.options.loop) {
            this.currentIndex = 0;
            this.activeSlideIndex = 0;
            if (this.slides[0]) {
                this.slides[0].classList.add('zhenshangyin-slide-active');
            }
        }

        if (this.options.magnifier) {
            this.initMagnifier();
        }
        if (this.options.loop) {
            for (let i = this.slides.length - 1; i >= 0; i--) {
                const clonedSlide = this.slides[i].cloneNode(true);
                this.wrapper.insertBefore(clonedSlide, this.wrapper.firstChild);
            }
            for (let i = 0; i < this.slides.length; i++) {
                const clonedSlide = this.slides[i].cloneNode(true);
                this.wrapper.appendChild(clonedSlide);
            }
            this.slides = Array.from(this.wrapper.children);
            this.currentIndex = this.slides.length / 3;
            this.wrapper.style.transition = 'none';
            this.updateSlides();
            this.wrapper.offsetHeight;
            this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
            this.slides.forEach((slide, i) => {
                if (slide && slide.classList) {
                    slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
                }
            });
        }
        if (this.options.pagination && Object.keys(this.options.pagination).length > 0) {
            this.createPagination();
        }
        this.createNavButtons();
        if (this.options.mousewheel) {
            this.bindMouseWheelEvent();
        }
        if (this.options.keyboard) {
            this.bindKeyboardEvent();
        }

        if (this.options.touchable) {
            this.initTouchEvents();
        }

        this.updateSlides();
        this.initResizeObserver();
        this.wrapper.style.transition = 'none';
        this.updateSlides(false);
        this.wrapper.offsetHeight;
        this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
        if (this.options.loop) {
            this.slides.forEach((slide, i) => {
                if (slide && slide.classList) {
                    slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
                }
            });
        }
        if (this.options.effect === 'fade' || this.options.direction === 'vertical') {
            this.updateContainerHeight();
        }
        this.initEventListeners();
        this.checkImagesLoaded();


        if (this.options.autoplay) {
            setTimeout(() => {
                this.startAutoplay();
            }, 0);
        }

        if (this.options.pauseOnMouseEnter && this.options.autoplay) {
            this.container.addEventListener('mouseenter', () => {
                this.isMouseOver = true;

            });
            this.container.addEventListener('mouseleave', () => {
                this.isMouseOver = false;

            });
        }

        if (this.options.linkedGroup) {
            ZhenshangyinSwiper.addToLinkedGroup(this, this.options.linkedGroup);
            if (this.options.clickToSlide === false) {
                this.options.clickToSlide = true;
            }
        }

        if (this.isTransformsEnabled()) {
            this.initTransformEffects();
        }

        this.allowClick = true;
        this.isTouched = false;
        this.isMoved = false;


    }
    togglePlayPause() {
        this.manuallyPaused = !this.manuallyPaused;
        if (this.manuallyPaused) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    _markUserInteraction() {
        this._pendingAutoplayReset = true;
    }

    resetAutoplay() {
        if (this.options.autoplay && !this.manuallyPaused) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }
    initResizeObserver() {
        if (typeof ResizeObserver !== 'undefined' && this.container && this.container instanceof Element) {
            let resizeTimeout;
            this.resizeObserver = new ResizeObserver(entries => {
                if (resizeTimeout) {
                    window.cancelAnimationFrame(resizeTimeout);
                }
                resizeTimeout = window.requestAnimationFrame(() => {
                    for (let entry of entries) {
                        const newWidth = entry.contentRect.width;
                        const newHeight = entry.contentRect.height;
                        if (newWidth !== this.containerWidth || newHeight !== this.containerHeight) {
                            this.containerWidth = newWidth;
                            this.containerHeight = newHeight;
                            this.updateLayout();
                        }
                    }
                });
            });
            this.resizeObserver.observe(this.container);
        } else {
            window.addEventListener('resize', this.handleResize.bind(this));
        }
    }
    handleResize() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            const newWidth = this.container.offsetWidth;
            const newHeight = this.container.offsetHeight;
            if (newWidth !== this.containerWidth || newHeight !== this.containerHeight) {

                this.containerWidth = newWidth;
                this.containerHeight = newHeight;
                this.updateLayout();
            }
        }, 100);
    }
    updateLayout() {
        if (this._isUpdating) return;
        this._isUpdating = true;

        this.checkBreakpointWithLoop();
        const wasAutoplaying = !!this.autoplayTimer;
        if (wasAutoplaying) {
            this.stopAutoplay();
        }
        requestAnimationFrame(() => {
            this.wrapper.style.transition = 'none';
            if (this.options.effect === 'fade' || this.options.direction === 'vertical') {
                this.updateContainerHeight();
            }
            this.updateSlides();
            this.createPagination();
            this.updatePaginationState();
            this.updateNavigationState();
            this.wrapper.offsetHeight;
            requestAnimationFrame(() => {
                this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
                if (this.options.effect === 'fade') {
                    this.slides.forEach(slide => {
                        slide.style.transition = `opacity ${this.options.speed}ms ease`;
                    });
                }

                if (wasAutoplaying) {
                    this.startAutoplay();
                }

                this._isUpdating = false;
            });
        });
    }
    rebuildSlidesForLoopChange(prevLoop, newLoop) {
        if (!this.wrapper) return;

        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild);
        }

        let baseSlides;
        if (this._originalSlides && this._originalSlides.length) {
            baseSlides = this._originalSlides;
        } else if (this.slides && this.slides.length) {
            baseSlides = this.slides.filter(slide => slide && slide.classList && slide.classList.contains('zhenshangyin-slide'));
        } else {
            baseSlides = [];
        }

        baseSlides.forEach(slide => {
            this.wrapper.appendChild(slide.cloneNode(true));
        });

        this.slides = Array.from(this.wrapper.children);

        this.currentIndex = 0;
        this.activeSlideIndex = 0;

        if (newLoop && this.slides.length) {
            for (let i = this.slides.length - 1; i >= 0; i--) {
                const clonedSlide = this.slides[i].cloneNode(true);
                this.wrapper.insertBefore(clonedSlide, this.wrapper.firstChild);
            }
            for (let i = 0; i < this.slides.length; i++) {
                const clonedSlide = this.slides[i].cloneNode(true);
                this.wrapper.appendChild(clonedSlide);
            }
            this.slides = Array.from(this.wrapper.children);
            this.currentIndex = this.slides.length / 3;
        }

        this.slides.forEach((slide, i) => {
            if (slide && slide.classList) {
                slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
            }
        });

        this.currentTranslate = 0;
        this.latestTranslate = 0;
        this.touchStartTranslate = 0;

        if (this.options.linkedGroup && this.options.clickToSlide) {
            this.initClickToSlide();
        }
    }

    createPagination() {
        const paginationConfig = this.options.pagination;
        if (!paginationConfig || typeof paginationConfig !== 'object') return;

        const isSingleSlide = !this.options.loop && this.slides.length <= 1;
        if (isSingleSlide) {
            this.hidePaginationElements();
            return;
        }

        if (paginationConfig.el) {
            let type = 'bullets';
            if (paginationConfig.type) {
                type = paginationConfig.type;
            }

            const pagerEls = typeof paginationConfig.el === 'string'
                ? document.querySelectorAll(paginationConfig.el)
                : [paginationConfig.el];

            if (!pagerEls || pagerEls.length === 0) return;

            pagerEls.forEach(pagerEl => {
                if (!pagerEl) return;
                pagerEl.classList.add(`zhenshangyin-pager-${type}`);
                this.createPaginationByType(type, pagerEl, paginationConfig);
            });
            return;
        }

        const paginationTypes = ['bullets', 'numbers', 'fraction', 'progressbar', 'scrollbar'];

        paginationTypes.forEach(type => {
            const config = paginationConfig[type];
            if (!config || !config.el) return;

            const pagerEls = typeof config.el === 'string'
                ? document.querySelectorAll(config.el)
                : [config.el];

            if (!pagerEls || pagerEls.length === 0) return;

            pagerEls.forEach(pagerEl => {
                if (!pagerEl) return;
                pagerEl.classList.add(`zhenshangyin-pager-${type}`);
                this.createPaginationByType(type, pagerEl, config);
            });
        });
    }

    createPaginationByType(type, pagerEl, config) {
        pagerEl.innerHTML = '';

        if (!this._pagerDelegates) this._pagerDelegates = [];
        if (!this._pagerDelegatedEls) this._pagerDelegatedEls = new WeakSet();

        const formatNumber = (num, style) => {
            if (!style) return num;

            switch (style) {
                case 'padded':
                    return num < 10 ? `0${num}` : `${num}`;
                case 'chinese':
                    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
                    if (num <= 10) return chineseNums[num];
                    if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
                    return chineseNums[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
                case 'roman':
                    const romanNums = {
                        1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X',
                        40: 'XL', 50: 'L', 90: 'XC', 100: 'C'
                    };
                    let result = '';
                    const values = Object.keys(romanNums).map(Number).sort((a, b) => b - a);
                    let remaining = num;
                    for (let value of values) {
                        while (remaining >= value) {
                            result += romanNums[value];
                            remaining -= value;
                        }
                    }
                    return result;
                default:
                    return num;
            }
        };

        const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        const group = this.options.slidesPerGroup || 1;

        const handleSlideChange = (index) => {
            const isLinkedStrict = !!(this.options.linkedGroup && !this.options.loop && !this.options.centeredSlides);
            const step = group * rows;
            let targetSlideIndex = isLinkedStrict ? index : (index * step);

            if (!this.options.loop && !this.options.centeredSlides && !this.options.linkedGroup) {
                let maxIndex = this.slides.length - 1;
                if (this.options.slidesPerView === 'auto') {
                    maxIndex = this.getAutoMaxIndex();
                } else if (typeof this.options.slidesPerView === 'number') {
                    if (rows > 1) {
                        const totalColumns = Math.ceil(this.slides.length / rows);
                        const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                        maxIndex = maxColumnsStart * rows;
                    } else {
                        maxIndex = Math.max(0, this.slides.length - (this.options.slidesPerView * rows));
                    }
                }
                targetSlideIndex = Math.min(targetSlideIndex, maxIndex);
            }

            this._markUserInteraction();
            this.slideTo(targetSlideIndex);
        };

        let totalSlides, initialProgress;
        const isLinkedStrict = !!(this.options.linkedGroup && !this.options.loop && !this.options.centeredSlides);

        if (this.options.loop) {
            totalSlides = Math.ceil((this.slides.length / 3) / (group * rows));
        } else if (this.options.centeredSlides) {
            totalSlides = Math.ceil(this.slides.length / (group * rows));
        } else if (this.options.slidesPerView === 'auto') {
            const containerWidth = this.container.getBoundingClientRect().width;
            const slideRect = this.slides[0].getBoundingClientRect();
            const slideWidth = slideRect.width + (this.options.spaceBetween || 0);
            const visibleSlides = Math.floor(containerWidth / slideWidth);
            totalSlides = Math.max(1, Math.ceil((this.slides.length - visibleSlides) / group) + 1);
        } else {
            if (rows > 1 && typeof this.options.slidesPerView === 'number') {
                const totalColumns = Math.ceil(this.slides.length / rows);
                const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                totalSlides = Math.floor(maxColumnsStart / group) + 1;
            } else {
                totalSlides = Math.max(1, Math.ceil((this.slides.length - (this.options.slidesPerView * rows)) / (group * rows)) + 1);
            }
        }

        if (isLinkedStrict) {
            totalSlides = this.slides.length;
        }

        initialProgress = totalSlides > 1 ? 1 / totalSlides : 1;

        switch (type) {
            case 'bullets':
                let bulletCount;
                if (this.options.loop) {
                    bulletCount = Math.ceil((this.slides.length / 3) / (group * rows));
                } else if (this.options.centeredSlides) {
                    bulletCount = Math.ceil(this.slides.length / (group * rows));
                } else if (typeof this.options.slidesPerView === 'number') {
                    bulletCount = Math.max(1, Math.ceil((this.slides.length - (this.options.slidesPerView * rows)) / (group * rows)) + 1);
                } else if (this.options.slidesPerView === 'auto') {
                    const containerWidth = this.container.getBoundingClientRect().width;
                    const slideRect = this.slides[0].getBoundingClientRect();
                    const slideWidth = slideRect.width + (this.options.spaceBetween || 0);
                    const visibleSlides = Math.floor(containerWidth / slideWidth);
                    const remainingSlides = this.slides.length - visibleSlides;
                    bulletCount = remainingSlides > 0 ? Math.ceil(remainingSlides / group) + 1 : 1;
                } else {
                    bulletCount = Math.max(1, Math.ceil((this.slides.length - this.options.slidesPerView) / group) + 1);
                }
                if (isLinkedStrict) {
                    bulletCount = this.slides.length;
                }

                for (let i = 0; i < bulletCount; i++) {
                    const bullet = document.createElement('div');
                    const innerDiv = document.createElement('div');
                    innerDiv.classList.add('zhenshangyin-pager-bullets-bullet-inner');
                    bullet.appendChild(innerDiv);
                    bullet.classList.add('zhenshangyin-pager-bullets-bullet');
                    bullet.dataset.index = String(i);
                    if (i === 0) bullet.classList.add('active');
                    pagerEl.appendChild(bullet);
                }
                if (!this._pagerDelegatedEls.has(pagerEl)) {
                    const clickHandler = (ev) => {
                        if (config.clickable === false) return;
                        const target = ev.target.closest('.zhenshangyin-pager-bullets-bullet');
                        if (!target || !pagerEl.contains(target)) return;
                        const idx = parseInt(target.dataset.index || '0', 10);
                        handleSlideChange(idx);
                    };
                    const hoverHandler = (ev) => {
                        if (!config.hoverChange) return;
                        const target = ev.target.closest('.zhenshangyin-pager-bullets-bullet');
                        if (!target || !pagerEl.contains(target)) return;
                        const idx = parseInt(target.dataset.index || '0', 10);
                        handleSlideChange(idx);
                    };
                    pagerEl.addEventListener('click', clickHandler, { passive: true });
                    pagerEl.addEventListener('mouseenter', hoverHandler, { passive: true, capture: true });
                    this._pagerDelegatedEls.add(pagerEl);
                    this._pagerDelegates.push({ el: pagerEl, clickHandler, hoverHandler });
                }
                break;
            case 'numbers':
                let totalNumberPages;

                totalNumberPages = totalSlides;

                for (let i = 0; i < totalNumberPages; i++) {
                    const number = document.createElement('span');
                    number.classList.add('zhenshangyin-pager-numbers-number');
                    number.dataset.index = String(i);

                    if (config.names?.[i]) {
                        number.innerHTML = config.names[i];
                    } else {
                        number.textContent = formatNumber(i + 1, config.style);
                    }

                    if (i === 0) number.classList.add('active');
                    pagerEl.appendChild(number);
                }
                if (!this._pagerDelegatedEls.has(pagerEl)) {
                    const clickHandler = (ev) => {
                        if (config.clickable === false) return;
                        const target = ev.target.closest('.zhenshangyin-pager-numbers-number');
                        if (!target || !pagerEl.contains(target)) return;
                        const idx = parseInt(target.dataset.index || '0', 10);
                        handleSlideChange(idx);
                    };
                    const hoverHandler = (ev) => {
                        if (!config.hoverChange) return;
                        const target = ev.target.closest('.zhenshangyin-pager-numbers-number');
                        if (!target || !pagerEl.contains(target)) return;
                        const idx = parseInt(target.dataset.index || '0', 10);
                        handleSlideChange(idx);
                    };
                    pagerEl.addEventListener('click', clickHandler, { passive: true });
                    pagerEl.addEventListener('mouseenter', hoverHandler, { passive: true, capture: true });
                    this._pagerDelegatedEls.add(pagerEl);
                    this._pagerDelegates.push({ el: pagerEl, clickHandler, hoverHandler });
                }
                break;
            case 'fraction':
                let totalFractionPages;

                totalFractionPages = totalSlides;

                if (config.style === 'progressbar') {
                    pagerEl.innerHTML = `
                        <span class="current">1</span>
                        <span class="separator">/</span>
                        <span class="total">${totalFractionPages}</span>
                        <div class="zhenshangyin-pager-fraction-progress"></div>
                    `;
                    const progressBar = pagerEl.querySelector('.zhenshangyin-pager-fraction-progress');
                    if (progressBar) {
                        progressBar.style.transform = `scaleX(${initialProgress})`;
                        progressBar.style.transformOrigin = 'left center';
                        progressBar.style.transition = `transform ${this.options.speed}ms ease`;
                    }
                } else {
                    pagerEl.innerHTML = `
                        <span class="current">${formatNumber(1, config.style)}</span>
                        <span class="separator">/</span>
                        <span class="total">${formatNumber(totalFractionPages, config.style)}</span>
                    `;
                }
                break;
            case 'progressbar':
                pagerEl.innerHTML = '<div class="zhenshangyin-pager-progressbar-progress"></div>';
                const fill = pagerEl.querySelector('.zhenshangyin-pager-progressbar-progress');
                if (fill) {
                    fill.style.transform = `scaleX(${initialProgress})`;
                    fill.style.transformOrigin = 'left center';
                    fill.style.transition = `transform ${this.options.speed}ms ease`;
                }
                break;
            case 'scrollbar':
                pagerEl.innerHTML = '<div class="zhenshangyin-pager-scrollbar-thumb"></div>';
                const thumb = pagerEl.querySelector('.zhenshangyin-pager-scrollbar-thumb');
                if (thumb) {
                    let visibleCount = 1;
                    if (!this.options.loop && !this.options.centeredSlides) {
                        if (this.options.slidesPerView === 'auto') {
                            const containerWidth = this.container.getBoundingClientRect().width;
                            const slideRect = this.slides[0].getBoundingClientRect();
                            const slideWidth = slideRect.width + (this.options.spaceBetween || 0);
                            visibleCount = Math.max(1, Math.floor(containerWidth / slideWidth));
                        } else if (typeof this.options.slidesPerView === 'number') {
                            visibleCount = Math.max(1, Math.min(this.options.slidesPerView, this.slides.length));
                        }
                    }
                    const thumbSize = Math.min(100, (visibleCount / Math.max(1, totalSlides)) * 100);
                    if (this.options.direction === 'horizontal') {
                        thumb.style.width = `${thumbSize}%`;
                        thumb.style.height = '100%';
                    } else {
                        thumb.style.width = '100%';
                        thumb.style.height = `${thumbSize}%`;
                    }
                }
                break;
        }
    }
    createNavButtons() {
        const { prevEl, nextEl } = this.options.navigation;
        if (!prevEl && !nextEl) return;

        const isSingleSlide = !this.options.loop && this.slides.length <= 1;
        if (isSingleSlide) {
            this.hideNavigationButtons();
            return;
        }

        if (prevEl) {
            this.prevButtons = typeof prevEl === 'string'
                ? Array.from(document.querySelectorAll(prevEl))
                : [prevEl];

            if (this.prevButtons.length) {
                this.prevButtons.forEach(button => {
                    button.classList.add('zhenshangyin-prev');
                    button.addEventListener('click', () => {
                        this._markUserInteraction();
                        this.slidePrev();
                    });
                });
            }
        }

        if (nextEl) {
            this.nextButtons = typeof nextEl === 'string'
                ? Array.from(document.querySelectorAll(nextEl))
                : [nextEl];

            if (this.nextButtons.length) {
                this.nextButtons.forEach(button => {
                    button.classList.add('zhenshangyin-next');
                    button.addEventListener('click', () => {
                        this._markUserInteraction();
                        this.slideNext();
                    });
                });
            }
        }

        this.updateNavigationState();
    }
    updateNavigationState() {
        if (!this.options.navigation.prevEl && !this.options.navigation.nextEl) {
            return;
        }

        const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        const shouldDisableAll = !this.options.loop && !this.options.centeredSlides &&
            this.slides.length <= (this.options.slidesPerView * rows) &&
            !this.options.linkedGroup;

        if (shouldDisableAll) {
            if (this.prevButtons) {
                this.prevButtons.forEach(button => {
                    button.classList.add('disabled');
                    button.style.pointerEvents = 'none';
                });
            }
            if (this.nextButtons) {
                this.nextButtons.forEach(button => {
                    button.classList.add('disabled');
                    button.style.pointerEvents = 'none';
                });
            }
            return;
        }

        if (!this.options.loop) {
            const isAtBeginning = this.currentIndex <= 0;
            let isAtEnd = false;

            if (this.options.centeredSlides) {
                isAtEnd = this.currentIndex >= this.slides.length - 1;
            } else if (this.options.slidesPerView === "auto") {
                const maxIndex = this.getAutoMaxIndex();
                isAtEnd = this.currentIndex >= maxIndex;
            } else {
                if (this.options.linkedGroup) {
                    isAtEnd = this.currentIndex >= (this.slides.length - 1);
                } else {
                    const group = this.options.slidesPerGroup || 1;
                    let maxIndex = this.slides.length - 1;
                    if (!this.options.centeredSlides && typeof this.options.slidesPerView === 'number') {
                        if (rows > 1) {
                            const totalColumns = Math.ceil(this.slides.length / rows);
                            const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                            maxIndex = maxColumnsStart * rows;
                        } else {
                            maxIndex = Math.max(0, this.slides.length - (this.options.slidesPerView * rows));
                        }
                    }
                    const nextIndex = Math.min(this.currentIndex + (group * rows), maxIndex);
                    isAtEnd = nextIndex === this.currentIndex;
                }
            }

            if (this.prevButtons) {
                this.prevButtons.forEach(button => {
                    button.classList.toggle('disabled', isAtBeginning);
                    button.style.pointerEvents = isAtBeginning ? 'none' : 'auto';
                });
            }

            if (this.nextButtons) {
                this.nextButtons.forEach(button => {
                    button.classList.toggle('disabled', isAtEnd);
                    button.style.pointerEvents = isAtEnd ? 'none' : 'auto';
                });
            }
        } else {
            if (this.prevButtons) {
                this.prevButtons.forEach(button => {
                    button.classList.remove('disabled');
                    button.style.pointerEvents = 'auto';
                });
            }
            if (this.nextButtons) {
                this.nextButtons.forEach(button => {
                    button.classList.remove('disabled');
                    button.style.pointerEvents = 'auto';
                });
            }
        }
    }
    updateSlides(updateActiveClass = true) {
        if (this.options.effect === 'fade') {
            this.wrapper.style.transform = 'translate3d(0, 0, 0)';
            const getRealIndex = (idx) => {
                if (this.options.loop) {
                    const slideCount = this.slides.length / 3;
                    let realIndex = idx - slideCount;
                    if (realIndex < 0) {
                        realIndex = slideCount - 1;
                    } else if (realIndex >= slideCount) {
                        realIndex = 0;
                    }
                    return realIndex;
                }
                return idx;
            };
            const realIndex = getRealIndex(this.currentIndex);
            this.slides.forEach((slide, index) => {
                slide.style.transition = `opacity ${this.options.speed}ms ease`;
                slide.style.position = 'absolute';
                slide.style.left = '0';
                slide.style.top = '0';
                slide.style.width = '100%';
                slide.style.opacity = '0';
                slide.style.zIndex = '1';
                if (updateActiveClass) {
                    slide.classList.remove('zhenshangyin-slide-active');
                }
                if (this.options.loop) {
                    const slideCount = this.slides.length / 3;
                    const isActiveSlide = [
                        realIndex,
                        realIndex + slideCount,
                        realIndex + (slideCount * 2)
                    ].includes(index);
                    if (isActiveSlide) {
                        slide.style.opacity = '1';
                        slide.style.zIndex = '2';
                        if (updateActiveClass) {
                            slide.classList.add('zhenshangyin-slide-active');
                        }
                    }
                } else {
                    if (index === this.currentIndex) {
                        slide.style.opacity = '1';
                        slide.style.zIndex = '2';
                        if (updateActiveClass) {
                            slide.classList.add('zhenshangyin-slide-active');
                        }
                    }
                }
            });
            const activeSlide = this.slides[this.currentIndex];
            if (activeSlide) {
                this.wrapper.style.height = `${activeSlide.offsetHeight}px`;
            }
            this.updatePaginationState();
            this.updateNavigationState();
            return;
        }

        if (this.options.direction === 'horizontal') {
            this.wrapper.style.width = '0px';
            this.wrapper.style.overflow = 'hidden';
        } else {
            this.wrapper.style.height = '0px';
            this.wrapper.style.overflow = 'hidden';
        }

        this.container.offsetHeight;

        const containerRect = this.container.getBoundingClientRect();
        const containerStyle = window.getComputedStyle(this.container);
        const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
        const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;

        const containerSize = this.options.direction === 'horizontal'
            ? containerRect.width - paddingLeft - paddingRight
            : containerRect.height - paddingTop - paddingBottom;

        this.wrapper.style.overflow = '';

        const gridRows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        const isGridEnabled = gridRows > 1 && typeof this.options.slidesPerView === 'number' && this.options.slidesPerView > 0;
        const gridColumnGap = this.options.spaceBetween || 0;
        const gridRowGap = typeof this.options.gridColumnGap === 'number' ? this.options.gridColumnGap : (this.options.spaceBetween || 0);

        if (this.options.direction === 'horizontal') {
            this.wrapper.style.width = `${containerRect.width}px`;
            this.wrapper.style.marginLeft = `-${paddingLeft}px`;
            this.wrapper.style.paddingLeft = `${paddingLeft}px`;
            this.wrapper.style.paddingRight = `${paddingRight}px`;
        } else {
            this.wrapper.style.height = `${containerRect.height}px`;
            this.wrapper.style.marginTop = `-${paddingTop}px`;
            this.wrapper.style.paddingTop = `${paddingTop}px`;
            this.wrapper.style.paddingBottom = `${paddingBottom}px`;
        }

        if (this.options.slidesPerView === "auto") {
            try {
                this.wrapper.style.display = '';
                this.wrapper.style.gridAutoFlow = '';
                this.wrapper.style.gridTemplateRows = '';
                this.wrapper.style.gridTemplateColumns = '';
                this.wrapper.style.columnGap = '';
                this.wrapper.style.rowGap = '';
            } catch (_) { }
            const slideSize = this.getSlideSize();
            const totalOffset = slideSize + this.options.spaceBetween;
            this.slides.forEach((slide, index) => {
                if (this.options.direction === 'horizontal') {
                    slide.style.width = `${slideSize}px`;
                    slide.style.height = '100%';
                    slide.style.marginRight = index === this.slides.length - 1 ? '0' : `${this.options.spaceBetween}px`;
                } else {
                    slide.style.width = '100%';
                    slide.style.height = `${slideSize}px`;
                    slide.style.marginBottom = index === this.slides.length - 1 ? '0' : `${this.options.spaceBetween}px`;
                }
            });

            let offset;
            if (this.options.centeredSlides) {
                const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                const centerOffset = mode === 'pair'
                    ? (containerSize - (2 * slideSize + this.options.spaceBetween)) / 2
                    : (containerSize - slideSize) / 2;
                if (this.options.loop) {
                    offset = -this.currentIndex * totalOffset + centerOffset;
                } else {
                    const maxSlides = this.slides.length - 1;
                    const limitedIndex = Math.min(this.currentIndex, maxSlides);
                    offset = -limitedIndex * totalOffset + centerOffset;
                }
            } else if (this.options.loop) {
                offset = -(this.currentIndex * totalOffset);
            } else {
                const maxSlides = Math.max(0, this.slides.length - this.options.slidesPerView);
                const limitedIndex = Math.min(this.currentIndex, maxSlides);
                offset = -(limitedIndex * totalOffset);
            }

            this.wrapper.style.transform = this.options.direction === 'horizontal'
                ? `translate3d(${offset}px, 0, 0)`
                : `translate3d(0, ${offset}px, 0)`;
        } else {
            if (isGridEnabled) {
                try {
                    this.wrapper.style.display = 'grid';
                    if (this.options.direction === 'horizontal') {
                        this.wrapper.style.gridAutoFlow = 'column';
                        this.wrapper.style.gridTemplateRows = `repeat(${gridRows}, auto)`;
                        this.wrapper.style.gridTemplateColumns = '';
                    } else {
                        this.wrapper.style.gridAutoFlow = 'row';
                        this.wrapper.style.gridTemplateColumns = `repeat(${gridRows}, auto)`;
                        this.wrapper.style.gridTemplateRows = '';
                    }
                    this.wrapper.style.columnGap = `${gridColumnGap}px`;
                    this.wrapper.style.rowGap = `${gridRowGap}px`;
                    this.wrapper.style.alignItems = 'stretch';
                } catch (_) { }

                const cols = this.options.slidesPerView;
                const colGaps = (Math.min(cols, Math.max(1, Math.ceil(this.slides.length / gridRows))) - 1) * gridColumnGap;
                const availableMain = containerSize - colGaps;
                const colSize = availableMain / cols;

                this.slides.forEach((slide) => {
                    if (this.options.direction === 'horizontal') {
                        slide.style.width = `${colSize}px`;
                        slide.style.height = '';
                        slide.style.marginRight = '0';
                        slide.style.marginBottom = '0';
                    } else {
                        slide.style.width = '';
                        slide.style.height = `${colSize}px`;
                        slide.style.marginRight = '0';
                        slide.style.marginBottom = '0';
                    }
                });

                const totalOffset = colSize + gridColumnGap;
                let offset;
                const columnIndex = Math.floor(this.currentIndex / gridRows);
                if (this.options.centeredSlides) {
                    const centerOffset = (containerSize - colSize) / 2;
                    if (this.options.loop) {
                        offset = -columnIndex * totalOffset + centerOffset;
                    } else {
                        const maxColumns = Math.max(0, Math.ceil(this.slides.length / gridRows) - 1);
                        const limitedCol = Math.min(columnIndex, maxColumns);
                        offset = -limitedCol * totalOffset + centerOffset;
                    }
                } else if (this.options.loop) {
                    offset = -(columnIndex * totalOffset);
                } else {
                    const maxColumnsStart = Math.max(0, Math.ceil(this.slides.length / gridRows) - cols);
                    const limitedCol = Math.min(columnIndex, maxColumnsStart);
                    offset = -(limitedCol * totalOffset);
                }

                this.wrapper.style.transform = this.options.direction === 'horizontal'
                    ? `translate3d(${offset}px, 0, 0)`
                    : `translate3d(0, ${offset}px, 0)`;
            } else {
                try {
                    this.wrapper.style.display = '';
                    this.wrapper.style.gridAutoFlow = '';
                    this.wrapper.style.gridTemplateRows = '';
                    this.wrapper.style.gridTemplateColumns = '';
                    this.wrapper.style.columnGap = '';
                    this.wrapper.style.rowGap = '';
                } catch (_) { }

                const totalGap = this.options.spaceBetween * (Math.min(this.options.slidesPerView, this.slides.length) - 1);
                const availableSpace = containerSize - totalGap;
                const slideSize = availableSpace / this.options.slidesPerView;
                const totalOffset = slideSize + this.options.spaceBetween;

                this.slides.forEach((slide, index) => {
                    if (this.options.direction === 'horizontal') {
                        slide.style.width = `${slideSize}px`;
                        slide.style.height = '100%';
                        slide.style.marginRight = index === this.slides.length - 1 ? '0' : `${this.options.spaceBetween}px`;
                    } else {
                        slide.style.width = '100%';
                        slide.style.height = `${slideSize}px`;
                        slide.style.marginBottom = index === this.slides.length - 1 ? '0' : `${this.options.spaceBetween}px`;
                    }
                });

                let offset;
                if (this.options.centeredSlides) {
                    const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                    const centerOffset = mode === 'pair'
                        ? (containerSize - (2 * slideSize + this.options.spaceBetween)) / 2
                        : (containerSize - slideSize) / 2;
                    if (this.options.loop) {
                        offset = -this.currentIndex * totalOffset + centerOffset;
                    } else {
                        const maxSlides = this.slides.length - 1;
                        const limitedIndex = Math.min(this.currentIndex, maxSlides);
                        offset = -limitedIndex * totalOffset + centerOffset;
                    }
                } else if (this.options.loop) {
                    offset = -(this.currentIndex * totalOffset);
                } else {
                    const maxSlides = Math.max(0, this.slides.length - this.options.slidesPerView);
                    const limitedIndex = Math.min(this.currentIndex, maxSlides);
                    offset = -(limitedIndex * totalOffset);
                }

                this.wrapper.style.transform = this.options.direction === 'horizontal'
                    ? `translate3d(${offset}px, 0, 0)`
                    : `translate3d(0, ${offset}px, 0)`;
            }
        }

        const updateActiveClasses = () => {
            if (!this.slides) return;
            const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
            if (this._lastActiveIndices === undefined || this._lastActiveIndices === null) {
                this._lastActiveIndices = new Set();
            }

            const newActiveIndices = new Set();
            if (this.options.loop) {
                const slideCount = this.slides.length / 3;
                const realIndex = this.currentIndex % slideCount;
                if (realIndex >= 0 && realIndex < slideCount) {
                    newActiveIndices.add(this.currentIndex);
                    if (mode === 'pair') {
                        newActiveIndices.add(this.currentIndex + 1);
                    }
                }
            } else {
                if (this.activeSlideIndex !== undefined && this.activeSlideIndex < this.slides.length) {
                    newActiveIndices.add(this.activeSlideIndex);
                    if (mode === 'pair') {
                        newActiveIndices.add(this.activeSlideIndex + 1);
                    }
                }
            }
            this._lastActiveIndices.forEach(idx => {
                if (!newActiveIndices.has(idx)) {
                    const el = this.slides[idx];
                    if (el && el.classList) el.classList.remove('zhenshangyin-slide-active');
                }
            });
            newActiveIndices.forEach(idx => {
                if (!this._lastActiveIndices.has(idx)) {
                    const el = this.slides[idx];
                    if (el && el.classList) el.classList.add('zhenshangyin-slide-active');
                }
            });
            this._lastActiveIndices = newActiveIndices;
        }

        if (this.isTransformsEnabled()) {
            this.updateTransforms();
        }

        this.updatePaginationState();
        this.updateNavigationState();
    }
    slideTo(index, noTransition = false, forceDirection = false) {
        if (this.isAnimating && !noTransition) return;


        const debugBeforeIndex = this.currentIndex;

        this.isAnimating = true;
        const totalSlideCount = this.options.loop ? this.slides.length / 3 : this.slides.length;
        const needsPositionReset = this.options.loop && (index < totalSlideCount || index >= totalSlideCount * 2);

        if (this.options.effect === 'fade') {
            this.currentIndex = index;
            this.updateSlides(false);
            this.slides.forEach((slide, i) => {
                if (slide && slide.classList) {
                    slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
                }
            });
            setTimeout(() => {
                this.isAnimating = false;
                if (this.options.loop) {
                    const slideCount = this.slides.length / 3;
                    if (index < slideCount) {
                        this.currentIndex = index + slideCount;
                        this.activeSlideIndex = index;
                        this.wrapper.style.transition = 'none';
                        this.updateSlides(false);
                        this.slides.forEach((slide, i) => {
                            if (slide && slide.classList) {
                                slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
                            }
                        });
                    } else if (index >= slideCount * 2) {
                        this.currentIndex = index - slideCount;
                        this.activeSlideIndex = index;
                        this.wrapper.style.transition = 'none';
                        this.updateSlides(false);
                        this.slides.forEach((slide, i) => {
                            if (slide && slide.classList) {
                                slide.classList.toggle('zhenshangyin-slide-active', i === this.currentIndex);
                            }
                        });
                    }
                }
            }, this.options.speed);
            return;
        }
        const getRealIndex = (idx) => {
            if (this.options.loop) {
                const slideCount = this.slides.length / 3;
                let realIndex = idx - slideCount;
                if (realIndex < 0) {
                    realIndex = slideCount - 1;
                } else if (realIndex >= slideCount) {
                    realIndex = 0;
                }
                return realIndex;
            }
            return idx;
        };

        if (this.options.loop && !forceDirection) {
            const slideCount = this.slides.length / 3;
            if (slideCount > 1) {
                const realCurrentIndex = this.currentIndex % slideCount;
                let realTargetIndex = index % slideCount;
                if (realTargetIndex < 0) {
                    realTargetIndex += slideCount;
                }

                const forwardDistance = (realTargetIndex >= realCurrentIndex) ?
                    realTargetIndex - realCurrentIndex :
                    realTargetIndex + slideCount - realCurrentIndex;

                const backwardDistance = (realCurrentIndex >= realTargetIndex) ?
                    realCurrentIndex - realTargetIndex :
                    realCurrentIndex + slideCount - realTargetIndex;

                if (forwardDistance < backwardDistance) {
                    index = this.currentIndex + forwardDistance;
                } else if (backwardDistance < forwardDistance) {
                    index = this.currentIndex - backwardDistance;
                } else {
                    if (index > this.currentIndex) {
                        index = this.currentIndex + forwardDistance;
                    } else {
                        index = this.currentIndex - backwardDistance;
                    }
                }
            }
        }

        if (!noTransition) {
            const activeSlide = this.slides[this.currentIndex];
            const activeClasses = activeSlide ? Array.from(activeSlide.classList || []) : [];
            const realCurrentIndex = getRealIndex(this.currentIndex);

        }
        const computeOffsetForIndex = (targetIndex, fromIndexForHeuristics) => {
            const containerSize = this.options.direction === 'horizontal'
                ? this.container.offsetWidth
                : this.container.offsetHeight;
            let offset;

            if (this.options.slidesPerView === "auto") {
                const targetSlide = this.slides[targetIndex];
                if (!targetSlide) return null;

                const useBaseStep = this.isTransformsEnabled && this.isTransformsEnabled();
                if (useBaseStep) {
                    const baseSlide = this.getSlideSize();
                    const totalStep = baseSlide + this.options.spaceBetween;
                    if (this.options.centeredSlides) {
                        const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                        if (mode === 'pair') {
                            const centerOffset = (containerSize - (2 * baseSlide + this.options.spaceBetween)) / 2;
                            offset = -(targetIndex * totalStep) + centerOffset;
                        } else {
                            const centerOffset = (containerSize - baseSlide) / 2;
                            offset = -(targetIndex * totalStep) + centerOffset;
                        }
                    } else {
                        offset = -(targetIndex * totalStep);
                    }
                } else {
                    const slideRects = this.slides.map(slide => slide.getBoundingClientRect());
                    const targetSlideRect = slideRects[targetIndex];
                    if (!targetSlideRect) return null;

                    const slideSize = this.options.direction === 'horizontal'
                        ? targetSlideRect.width
                        : targetSlideRect.height;

                    if (this.options.loop && this.options.centeredSlides) {
                        const centerOffset = (containerSize - slideSize) / 2;
                        let targetOffset = 0;
                        for (let i = 0; i < targetIndex; i++) {
                            targetOffset += (this.options.direction === 'horizontal'
                                ? slideRects[i].width
                                : slideRects[i].height) + this.options.spaceBetween;
                        }
                        const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                        if (mode === 'pair') {
                            const nextRect = slideRects[targetIndex + 1];
                            if (!nextRect) {
                                offset = -targetOffset + centerOffset;
                            } else {
                                const pairSize = slideSize + this.options.spaceBetween + (this.options.direction === 'horizontal' ? nextRect.width : nextRect.height);
                                const pairCenterOffset = (containerSize - pairSize) / 2;
                                offset = -targetOffset + pairCenterOffset;
                            }
                        } else {
                            offset = -targetOffset + centerOffset;
                        }
                    } else if (this.options.loop && !this.options.centeredSlides) {
                        let targetOffset = 0;
                        for (let i = 0; i < targetIndex; i++) {
                            targetOffset += (this.options.direction === 'horizontal'
                                ? slideRects[i].width
                                : slideRects[i].height) + this.options.spaceBetween;
                        }
                        offset = -targetOffset;
                    } else if (!this.options.loop && this.options.centeredSlides) {
                        const centerOffset = (containerSize - slideSize) / 2;
                        let targetOffset = 0;
                        for (let i = 0; i < targetIndex; i++) {
                            targetOffset += (this.options.direction === 'horizontal'
                                ? slideRects[i].width
                                : slideRects[i].height) + this.options.spaceBetween;
                        }
                        const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                        if (mode === 'pair') {
                            const nextRect = slideRects[targetIndex + 1];
                            if (!nextRect) {
                                offset = -targetOffset + centerOffset;
                            } else {
                                const pairSize = slideSize + this.options.spaceBetween + (this.options.direction === 'horizontal' ? nextRect.width : nextRect.height);
                                const pairCenterOffset = (containerSize - pairSize) / 2;
                                offset = -targetOffset + pairCenterOffset;
                            }
                        } else {
                            offset = -targetOffset + centerOffset;
                        }
                    } else {
                        let targetOffset = 0;
                        let totalSlidesWidth = 0;

                        slideRects.forEach((rect, idx) => {
                            totalSlidesWidth += (this.options.direction === 'horizontal'
                                ? rect.width
                                : rect.height);
                            if (idx < this.slides.length - 1) {
                                totalSlidesWidth += this.options.spaceBetween;
                            }
                        });

                        const containerWidth = this.options.direction === 'horizontal'
                            ? this.container.offsetWidth
                            : this.container.offsetHeight;

                        for (let i = 0; i < targetIndex; i++) {
                            targetOffset += (this.options.direction === 'horizontal'
                                ? slideRects[i].width
                                : slideRects[i].height) + this.options.spaceBetween;
                        }

                        offset = -targetOffset;

                        if (!this.options.loop && !this.options.centeredSlides) {
                            const minTranslate = containerWidth - totalSlidesWidth;
                            const maxTranslate = 0;
                            offset = Math.max(minTranslate, Math.min(maxTranslate, offset));
                        }
                    }
                }

                return offset;
            }

            const gridRows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
            const isGridEnabled = gridRows > 1 && typeof this.options.slidesPerView === 'number' && this.options.slidesPerView > 0;
            const gridColumnGap = this.options.spaceBetween || 0;
            const gridRowGap = typeof this.options.gridColumnGap === 'number' ? this.options.gridColumnGap : (this.options.spaceBetween || 0);

            if (isGridEnabled) {
                const cols = this.options.slidesPerView;
                const totalGap = gridColumnGap * (Math.min(cols, Math.max(1, Math.ceil(this.slides.length / gridRows))) - 1);
                const availableSpace = containerSize - totalGap;
                const colSize = availableSpace / cols;
                const totalOffset = colSize + gridColumnGap;

                const columnIndex = Math.floor(targetIndex / gridRows);

                if (this.options.centeredSlides) {
                    const centerOffset = (containerSize - colSize) / 2;
                    if (this.options.loop) {
                        offset = -(columnIndex * totalOffset) + centerOffset;
                    } else {
                        const maxColumns = Math.max(0, Math.ceil(this.slides.length / gridRows) - 1);
                        const limitedCol = Math.min(columnIndex, maxColumns);
                        offset = -(limitedCol * totalOffset) + centerOffset;
                    }
                } else if (this.options.loop) {
                    offset = -(columnIndex * totalOffset);
                } else {
                    const maxColumnsStart = Math.max(0, Math.ceil(this.slides.length / gridRows) - cols);
                    const limitedCol = Math.min(columnIndex, maxColumnsStart);
                    offset = -(limitedCol * totalOffset);
                }
                return offset;
            }

            const totalGap = this.options.spaceBetween * (Math.min(this.options.slidesPerView, this.slides.length) - 1);
            const availableSpace = containerSize - totalGap;
            const slideSize = availableSpace / this.options.slidesPerView;
            const totalOffset = slideSize + this.options.spaceBetween;

            if (this.options.centeredSlides && this.options.loop) {
                const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                const centerOffset = mode === 'pair'
                    ? (containerSize - (2 * slideSize + this.options.spaceBetween)) / 2
                    : (containerSize - slideSize) / 2;
                offset = -(targetIndex * totalOffset) + centerOffset;
                return offset;
            }

            if (this.options.centeredSlides) {
                const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                const centerOffset = mode === 'pair'
                    ? (containerSize - (2 * slideSize + this.options.spaceBetween)) / 2
                    : (containerSize - slideSize) / 2;
                if (!this.options.loop && targetIndex === 0) {
                    offset = centerOffset;
                } else if (!this.options.loop && targetIndex === this.slides.length - 1) {
                    offset = -(this.slides.length - 1) * totalOffset + centerOffset;
                } else {
                    offset = -(targetIndex * totalOffset) + centerOffset;
                }
                return offset;
            }

            if (this.options.loop) {
                offset = -(targetIndex * totalOffset);
                return offset;
            }

            const maxSlides = Math.max(0, this.slides.length - this.options.slidesPerView);
            const fromIdx = (typeof fromIndexForHeuristics === 'number') ? fromIndexForHeuristics : this.currentIndex;
            const windowStart = Math.max(0, Math.min(targetIndex, maxSlides));
            return -(windowStart * totalOffset);
        };

        const containerSize = this.options.direction === 'horizontal'
            ? this.container.offsetWidth
            : this.container.offsetHeight;

        let offset = computeOffsetForIndex(index, debugBeforeIndex);
        if (offset === null || offset === undefined) {
            this.isAnimating = false;
            return;
        }

        const slideCountForReset = this.options.loop ? (this.slides.length / 3) : this.slides.length;
        const isLoopResetPlanned = this.options.loop && ((index < slideCountForReset) || (index >= slideCountForReset * 2));
        let loopResetFinalIndex = null;
        let loopResetFinalOffset = null;
        if (isLoopResetPlanned) {
            if (index < slideCountForReset) {
                loopResetFinalIndex = index + slideCountForReset;
            } else if (index >= slideCountForReset * 2) {
                loopResetFinalIndex = index - slideCountForReset;
            }
            if (loopResetFinalIndex !== null) {
                loopResetFinalOffset = computeOffsetForIndex(loopResetFinalIndex, debugBeforeIndex);
            }
        }

        this.currentIndex = index;
        if (!noTransition) {
            this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
            this.updatePaginationState();
            this.updateNavigationState();
        } else {
            this.wrapper.style.transition = 'none';
            this.wrapper.style.transform = this.options.direction === 'horizontal'
                ? `translate3d(${offset}px, 0, 0)`
                : `translate3d(0, ${offset}px, 0)`;
        }

        const slideCount = this.options.loop ? this.slides.length / 3 : this.slides.length;

        if (!this.options.loop) {
            this.activeSlideIndex = index;
        } else {
            this.activeSlideIndex = index % slideCount;
        }

        const isLoopReset = this.options.loop && (
            (index < slideCount) || (index >= slideCount * 2)
        );

        const startActiveIndex = index;
        let finalActiveIndex = null;
        if (isLoopReset) {
            const loopSlideCount = this.slides.length / 3;
            if (index < loopSlideCount) {
                finalActiveIndex = index + loopSlideCount;
            } else if (index >= loopSlideCount * 2) {
                finalActiveIndex = index - loopSlideCount;
            }
        }
        this.slides.forEach((slide, i) => {
            if (!slide || !slide.classList) return;
            if (i !== startActiveIndex && i !== finalActiveIndex) {
                slide.classList.remove('zhenshangyin-slide-active');
            }
        });
        if (this.slides[startActiveIndex] && this.slides[startActiveIndex].classList) {
            this.slides[startActiveIndex].classList.add('zhenshangyin-slide-active');
        }
        if (finalActiveIndex !== null && this.slides[finalActiveIndex] && this.slides[finalActiveIndex].classList) {
            this.slides[finalActiveIndex].classList.add('zhenshangyin-slide-active');
        }
        if (!isLoopReset) {
            this.updateSlides(false);
        }

        if (!noTransition) {
            this.wrapper.style.transform = this.options.direction === 'horizontal'
                ? `translate3d(${offset}px, 0, 0)`
                : `translate3d(0, ${offset}px, 0)`;
        }

        setTimeout(() => {
            this.isAnimating = false;
            if (!noTransition) {
                const newActiveSlide = this.slides[index];
                const newActiveClasses = newActiveSlide ? Array.from(newActiveSlide.classList || []) : [];

            }

            const currentIsLoopReset = this.options.loop && (
                (index < slideCount) || (index >= slideCount * 2)
            );

            if (this.options.loop) {
                const loopSlideCount = this.slides.length / 3;
                if (index < loopSlideCount) {
                    this.currentIndex = index + loopSlideCount;
                    this.activeSlideIndex = index;

                    this.wrapper.style.transition = 'none';
                    this.slides.forEach(slide => {
                        slide.style.transition = 'none';
                    });

                    this.updateSlides(false);
                    this.updateTransforms();
                    this.wrapper.offsetHeight;

                    if (loopResetFinalIndex !== null && loopResetFinalOffset !== null && loopResetFinalIndex === this.currentIndex) {
                        this.wrapper.style.transform = this.options.direction === 'horizontal'
                            ? `translate3d(${loopResetFinalOffset}px, 0, 0)`
                            : `translate3d(0, ${loopResetFinalOffset}px, 0)`;
                        this.wrapper.offsetHeight;
                    }

                    if (this.slides[index] && this.slides[index].classList) {
                        this.slides[index].classList.remove('zhenshangyin-slide-active');
                    }

                    requestAnimationFrame(() => {
                        this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
                        this.slides.forEach(slide => {
                            slide.style.transition = `all ${this.options.speed}ms ease`;
                        });
                    });
                } else if (index >= loopSlideCount * 2) {
                    this.currentIndex = index - loopSlideCount;
                    this.activeSlideIndex = index;

                    this.wrapper.style.transition = 'none';
                    this.slides.forEach(slide => {
                        slide.style.transition = 'none';
                    });

                    this.updateSlides(false);
                    this.updateTransforms();
                    this.wrapper.offsetHeight;

                    if (loopResetFinalIndex !== null && loopResetFinalOffset !== null && loopResetFinalIndex === this.currentIndex) {
                        this.wrapper.style.transform = this.options.direction === 'horizontal'
                            ? `translate3d(${loopResetFinalOffset}px, 0, 0)`
                            : `translate3d(0, ${loopResetFinalOffset}px, 0)`;
                        this.wrapper.offsetHeight;
                    }

                    if (this.slides[index] && this.slides[index].classList) {
                        this.slides[index].classList.remove('zhenshangyin-slide-active');
                    }

                    requestAnimationFrame(() => {
                        this.wrapper.style.transition = `transform ${this.options.speed / 1000}s ease`;
                        this.slides.forEach(slide => {
                            slide.style.transition = `all ${this.options.speed}ms ease`;
                        });
                    });
                }
            }
        }, this.options.speed);

        const shouldResetAutoplay = !!(this._pendingAutoplayReset && !this._isAutoplayTick);

        if (this.options.linkedGroup && !noTransition && !this._isLinkedSyncing) {
            const realIndex = this.options.loop ?
                this.currentIndex % (this.slides.length / 3) :
                this.currentIndex;
            ZhenshangyinSwiper.notifyLinkedGroupChange(realIndex, this, this.options.linkedGroup);
        }

        if (shouldResetAutoplay) {
            this.resetAutoplay();
        }
        this._pendingAutoplayReset = false;
    }
    slideNext() {
        if (this.isAnimating) return;

        const shouldPreserveWindowStart = !!(
            this._isAutoplayTick &&
            this.options.linkedGroup &&
            !this.options.loop &&
            !this.options.centeredSlides &&
            typeof this.options.slidesPerView === 'number' &&
            this.options.slidesPerView > 1
        );

        const slideToWithAutoplayWindow = (targetIndex) => {
            if (shouldPreserveWindowStart) this._preserveWindowStart = true;
            this.slideTo(targetIndex);
        };

        const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        if (!this.options.loop && !this.options.centeredSlides &&
            this.slides.length <= (this.options.slidesPerView * rows) &&
            !this.options.linkedGroup) {
            return;
        }

        if (this.options.loop) {
            if (this.options.slidesPerView === "auto") {
                const nextIndex = this.currentIndex + (this.options.slidesPerGroup || 1);
                slideToWithAutoplayWindow(nextIndex);
            } else if (this.options.centeredSlides) {
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                const nextIndex = this.currentIndex + (this.options.slidesPerGroup * rows);
                if (nextIndex < this.slides.length) {
                    slideToWithAutoplayWindow(nextIndex);
                } else {
                    const slideCount = this.slides.length / 3;
                    const remainder = nextIndex % slideCount;
                    slideToWithAutoplayWindow(slideCount + remainder);
                }
            } else if (typeof this.options.slidesPerView === 'number' &&
                !this.options.centeredSlides) {
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                const nextIndex = this.currentIndex + (this.options.slidesPerGroup * rows);
                if (nextIndex < this.slides.length) {
                    slideToWithAutoplayWindow(nextIndex);
                } else {
                    const slideCount = this.slides.length / 3;
                    const remainder = nextIndex % slideCount;
                    slideToWithAutoplayWindow(slideCount + remainder);
                }
            } else {
                slideToWithAutoplayWindow(this.currentIndex + this.options.slidesPerGroup);
            }
        } else {
            if (this.options.slidesPerView === "auto") {
                const maxIndex = this.getAutoMaxIndex();
                const nextIndex = Math.min(this.currentIndex + (this.options.slidesPerGroup || 1), maxIndex);
                if (nextIndex === this.currentIndex) return;
                slideToWithAutoplayWindow(nextIndex);
            } else {
                let maxIndex = this.slides.length - 1;
                if (!this.options.linkedGroup && !this.options.centeredSlides && typeof this.options.slidesPerView === 'number') {
                    const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                    if (rows > 1) {
                        const totalColumns = Math.ceil(this.slides.length / rows);
                        const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                        maxIndex = maxColumnsStart * rows;
                    } else {
                        maxIndex = Math.max(0, this.slides.length - (this.options.slidesPerView * rows));
                    }
                }
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                let targetIndex = this.currentIndex + ((this.options.slidesPerGroup || 1) * rows);
                targetIndex = Math.min(targetIndex, maxIndex);
                if (!this.options.linkedGroup && targetIndex === this.currentIndex) return;
                slideToWithAutoplayWindow(targetIndex);
            }
        }
    }
    slidePrev() {
        if (this.isAnimating) return;

        const shouldPreserveWindowStart = !!(
            this._isAutoplayTick &&
            this.options.linkedGroup &&
            !this.options.loop &&
            !this.options.centeredSlides &&
            typeof this.options.slidesPerView === 'number' &&
            this.options.slidesPerView > 1
        );

        const slideToWithAutoplayWindow = (targetIndex) => {
            if (shouldPreserveWindowStart) this._preserveWindowStart = true;
            this.slideTo(targetIndex);
        };

        const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        if (!this.options.loop && !this.options.centeredSlides &&
            this.slides.length <= (this.options.slidesPerView * rows) &&
            !this.options.linkedGroup) {
            return;
        }

        if (this.options.loop) {
            if (this.options.slidesPerView === "auto") {
                const prevIndex = this.currentIndex - (this.options.slidesPerGroup || 1);
                slideToWithAutoplayWindow(prevIndex);
            } else if (this.options.centeredSlides) {
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                const prevIndex = this.currentIndex - (this.options.slidesPerGroup * rows);
                if (prevIndex >= 0) {
                    slideToWithAutoplayWindow(prevIndex);
                } else {
                    const slideCount = this.slides.length / 3;
                    const targetIndex = slideCount * 2 + (slideCount + (prevIndex % slideCount));
                    slideToWithAutoplayWindow(targetIndex);
                }
            } else if (typeof this.options.slidesPerView === 'number' &&
                !this.options.centeredSlides) {
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                const prevIndex = this.currentIndex - (this.options.slidesPerGroup * rows);
                if (prevIndex >= 0) {
                    slideToWithAutoplayWindow(prevIndex);
                } else {
                    const slideCount = this.slides.length / 3;
                    const targetIndex = slideCount * 2 + (slideCount + (prevIndex % slideCount));
                    slideToWithAutoplayWindow(targetIndex);
                }
            } else {
                slideToWithAutoplayWindow(this.currentIndex - this.options.slidesPerGroup);
            }
        } else {
            if (this.options.slidesPerView === "auto") {
                const prevIndex = Math.max(this.currentIndex - (this.options.slidesPerGroup || 1), 0);
                slideToWithAutoplayWindow(prevIndex);
            } else {
                const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
                let targetIndex = this.currentIndex - ((this.options.slidesPerGroup || 1) * rows);
                targetIndex = Math.max(targetIndex, 0);
                if (!this.options.linkedGroup && targetIndex === this.currentIndex) return;
                slideToWithAutoplayWindow(targetIndex);
            }
        }
    }
    startAutoplay() {
        if (this.options.autoplay && !this.autoplayTimer && !this.manuallyPaused) {
            this.autoplayTimer = setInterval(() => {
                this._isAutoplayTick = true;
                this.slideNext();
                this._isAutoplayTick = false;
            }, this.options.interval);
        }
    }
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;

        }
    }
    updatePaginationState(forceIndex = null) {
        const paginationConfig = this.options.pagination;
        if (!paginationConfig || typeof paginationConfig !== 'object') return;

        let actualIndex;
        let totalSlides;
        const isLinkedStrict = !!(this.options.linkedGroup && !this.options.loop && !this.options.centeredSlides);

        const rows = typeof this.options.grid === 'number' ? Math.max(1, Math.floor(this.options.grid)) : 1;
        const group = this.options.slidesPerGroup || 1;

        if (this.options.loop) {
            totalSlides = Math.ceil((this.slides.length / 3) / (group * rows));
        } else if (this.options.centeredSlides) {
            totalSlides = Math.ceil(this.slides.length / (group * rows));
        } else if (this.options.slidesPerView === 'auto') {
            const containerWidth = this.container.getBoundingClientRect().width;
            const slideWidth = this.slides[0].getBoundingClientRect().width + (this.options.spaceBetween || 0);
            const visibleSlides = Math.floor(containerWidth / slideWidth);
            totalSlides = Math.max(1, Math.ceil((this.slides.length - visibleSlides) / this.options.slidesPerGroup) + 1);
        } else {
            totalSlides = Math.max(1, Math.ceil((this.slides.length - (this.options.slidesPerView * rows)) / (group * rows)) + 1);
        }
        if (isLinkedStrict) {
            totalSlides = this.slides.length;
        }

        if (forceIndex !== null) {
            actualIndex = forceIndex;
        } else if (this.options.loop) {
            const slideCount = this.slides.length / 3;
            actualIndex = this.currentIndex % slideCount;
            actualIndex = Math.floor(actualIndex / (group * rows));
        } else {
            if (isLinkedStrict) {
                actualIndex = this.currentIndex;
            } else {
                let maxIndex = this.slides.length - 1;
                if (!this.options.centeredSlides) {
                    if (this.options.slidesPerView === 'auto') {
                        maxIndex = this.getAutoMaxIndex();
                    } else if (typeof this.options.slidesPerView === 'number') {
                        if (rows > 1) {
                            const totalColumns = Math.ceil(this.slides.length / rows);
                            const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                            maxIndex = maxColumnsStart * rows;
                        } else {
                            maxIndex = Math.max(0, this.slides.length - (this.options.slidesPerView * rows));
                        }
                    }
                }
                if (!this.options.linkedGroup && this.currentIndex >= maxIndex) {
                    actualIndex = totalSlides - 1;
                } else {
                    if (rows > 1 && typeof this.options.slidesPerView === 'number') {
                        const totalColumns = Math.ceil(this.slides.length / rows);
                        const maxColumnsStart = Math.max(0, totalColumns - this.options.slidesPerView);
                        const col = Math.min(Math.floor(this.currentIndex / rows), maxColumnsStart);
                        actualIndex = Math.floor(col / group);
                    } else {
                        actualIndex = Math.floor(this.currentIndex / (group * rows));
                    }
                }
            }
        }

        actualIndex = Math.max(0, Math.min(actualIndex, totalSlides - 1));

        if (paginationConfig.el) {
            const pagerEls = typeof paginationConfig.el === 'string'
                ? document.querySelectorAll(paginationConfig.el)
                : [paginationConfig.el];

            if (!pagerEls || pagerEls.length === 0) return;

            const type = paginationConfig.type || 'bullets';
            pagerEls.forEach(pagerEl => {
                if (!pagerEl) return;
                this.updatePaginationByType(type, pagerEl, actualIndex, totalSlides);
            });
            return;
        }

        const paginationTypes = ['bullets', 'numbers', 'fraction', 'progressbar', 'scrollbar'];
        paginationTypes.forEach(type => {
            const config = paginationConfig[type];
            if (!config || !config.el) return;

            const pagerEls = typeof config.el === 'string'
                ? document.querySelectorAll(config.el)
                : [config.el];

            if (!pagerEls || pagerEls.length === 0) return;

            pagerEls.forEach(pagerEl => {
                if (!pagerEl) return;
                this.updatePaginationByType(type, pagerEl, actualIndex, totalSlides);
            });
        });
    }

    updatePaginationByType(type, pagerEl, actualIndex, totalSlides) {
        const formatNumber = (num, style) => {
            if (!style) return num;

            switch (style) {
                case 'padded':
                    return num < 10 ? `0${num}` : `${num}`;
                case 'chinese':
                    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
                    if (num <= 10) return chineseNums[num];
                    if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
                    return chineseNums[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
                case 'roman':
                    const romanNums = {
                        1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X',
                        40: 'XL', 50: 'L', 90: 'XC', 100: 'C'
                    };
                    let result = '';
                    const values = Object.keys(romanNums).map(Number).sort((a, b) => b - a);
                    let remaining = num;
                    for (let value of values) {
                        while (remaining >= value) {
                            result += romanNums[value];
                            remaining -= value;
                        }
                    }
                    return result;
                default:
                    return num;
            }
        };

        const unitProgress = totalSlides > 1 ? 1 / totalSlides : 1;
        const progress = totalSlides > 1 ? (actualIndex + 1) / totalSlides : 1;

        switch (type) {
            case 'bullets':
                const bullets = pagerEl.querySelectorAll('.zhenshangyin-pager-bullets-bullet');
                bullets.forEach((bullet, idx) => {
                    bullet.classList.toggle('active', idx === actualIndex);
                });
                break;
            case 'numbers':
                const numbers = pagerEl.querySelectorAll('.zhenshangyin-pager-numbers-number');
                numbers.forEach((number, idx) => {
                    if (idx < totalSlides) {
                        number.style.display = '';
                        number.classList.toggle('active', idx === actualIndex);
                    } else {
                        number.style.display = 'none';
                    }
                });
                break;
            case 'fraction':
                const current = pagerEl.querySelector('.current');
                const total = pagerEl.querySelector('.total');
                const config = this.options.pagination.fraction || this.options.pagination;

                if (current) {
                    if (config.style === 'progressbar') {
                        current.textContent = actualIndex + 1;
                        const progressBar = pagerEl.querySelector('.zhenshangyin-pager-fraction-progress');
                        if (progressBar) {
                            progressBar.style.transform = `scaleX(${progress})`;
                        }
                    } else {
                        current.textContent = formatNumber(actualIndex + 1, config.style);
                    }
                }
                if (total) {
                    total.textContent = formatNumber(totalSlides, config.style);
                }
                break;
            case 'progressbar':
                const fill = pagerEl.querySelector('.zhenshangyin-pager-progressbar-progress');
                if (fill) {
                    fill.style.transform = `scaleX(${progress})`;
                    fill.style.transformOrigin = 'left center';
                    fill.style.transition = `transform ${this.options.speed}ms ease`;
                }
                break;
            case 'scrollbar':
                const thumb = pagerEl.querySelector('.zhenshangyin-pager-scrollbar-thumb');
                if (thumb) {
                    if (totalSlides > 1) {
                        const ratio = Math.max(0, Math.min(1, actualIndex / (totalSlides - 1)));
                        if (this.options.direction === 'horizontal') {
                            const track = pagerEl.clientWidth;
                            const size = thumb.clientWidth;
                            const maxMove = Math.max(0, track - size);
                            const x = ratio * maxMove;
                            thumb.style.transform = `translate3d(${x}px, 0, 0)`;
                        } else {
                            const track = pagerEl.clientHeight;
                            const size = thumb.clientHeight;
                            const maxMove = Math.max(0, track - size);
                            const y = ratio * maxMove;
                            thumb.style.transform = `translate3d(0, ${y}px, 0)`;
                        }
                        thumb.style.transition = `transform ${this.options.speed}ms ease`;
                    } else {
                        thumb.style.transform = `translate3d(0, 0, 0)`;
                    }
                }
                break;
        }
    }
    bindMouseWheelEvent() {
        let lastSlideChangeTime = 0;
        const slideChangeThrottle = 300;
        let pendingSlideChange = null;
        let scrollCheckTimeout = null;

        const canElementScroll = (element, delta) => {
            if (!element) return false;

            const isScrollable = element.scrollHeight > element.clientHeight;
            if (!isScrollable) return false;

            const tolerance = 3;
            const isAtTop = element.scrollTop <= tolerance;
            const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - tolerance;

            if (delta > 0) {
                return !isAtBottom;
            } else {
                return !isAtTop;
            }
        };

        const findScrollableElement = (target, delta) => {
            let element = target;
            const activeSlide = this.slides && this.slides[this.currentIndex];
            if (!activeSlide) return null;

            while (element && element !== document.body) {
                if (activeSlide.contains(element)) {
                    if (canElementScroll(element, delta)) {
                        return element;
                    }
                }
                element = element.parentElement;
            }

            if (canElementScroll(activeSlide, delta)) {
                return activeSlide;
            }

            return null;
        };

        const checkScrollState = (scrollableElement, deltaY) => {
            if (!scrollableElement) return;

            const tolerance = 3;
            const scrollTop = scrollableElement.scrollTop;
            const scrollHeight = scrollableElement.scrollHeight;
            const clientHeight = scrollableElement.clientHeight;
            const maxScroll = scrollHeight - clientHeight;

            const isAtTop = scrollTop <= tolerance;
            const isAtBottom = scrollTop >= maxScroll - tolerance;

            if (deltaY > 0 && isAtBottom) {
                pendingSlideChange = 'next';
            } else if (deltaY < 0 && isAtTop) {
                pendingSlideChange = 'prev';
            } else {
                pendingSlideChange = null;
            }
        };

        const handler = (e) => {
            const currentTime = Date.now();
            const intendToSlide = this.options.direction === 'vertical' ? Math.abs(e.deltaY) > Math.abs(e.deltaX) : true;
            if (!intendToSlide) return;

            const scrollableElement = findScrollableElement(e.target, e.deltaY);

            if (scrollableElement) {
                const tolerance = 3;
                const scrollTop = scrollableElement.scrollTop;
                const scrollHeight = scrollableElement.scrollHeight;
                const clientHeight = scrollableElement.clientHeight;
                const maxScroll = scrollHeight - clientHeight;

                const isAtTop = scrollTop <= tolerance;
                const isAtBottom = scrollTop >= maxScroll - tolerance;

                if (e.deltaY > 0 && isAtBottom) {
                    pendingSlideChange = null;
                    if (currentTime - lastSlideChangeTime >= slideChangeThrottle) {
                        lastSlideChangeTime = currentTime;
                        if (e.cancelable) e.preventDefault();
                        e.stopPropagation();
                        this._markUserInteraction();
                        this.slideNext();
                    }
                    return;
                } else if (e.deltaY < 0 && isAtTop) {
                    pendingSlideChange = null;
                    if (currentTime - lastSlideChangeTime >= slideChangeThrottle) {
                        lastSlideChangeTime = currentTime;
                        if (e.cancelable) e.preventDefault();
                        e.stopPropagation();
                        this._markUserInteraction();
                        this.slidePrev();
                    }
                    return;
                } else {
                    pendingSlideChange = null;
                    e.stopPropagation();
                }

                if (scrollCheckTimeout) {
                    clearTimeout(scrollCheckTimeout);
                }

                scrollCheckTimeout = setTimeout(() => {
                    checkScrollState(scrollableElement, e.deltaY);
                }, 30);

            } else {
                if (scrollCheckTimeout) {
                    clearTimeout(scrollCheckTimeout);
                    scrollCheckTimeout = null;
                }

                if (pendingSlideChange) {
                    const direction = pendingSlideChange;
                    const directionMatch = (direction === 'next' && e.deltaY > 0) || (direction === 'prev' && e.deltaY < 0);

                    if (directionMatch) {
                        pendingSlideChange = null;
                        if (currentTime - lastSlideChangeTime >= slideChangeThrottle) {
                            lastSlideChangeTime = currentTime;
                            if (e.cancelable) e.preventDefault();
                            if (direction === 'next') {
                                this._markUserInteraction();
                                this.slideNext();
                            } else {
                                this._markUserInteraction();
                                this.slidePrev();
                            }
                            return;
                        }
                    } else {
                        pendingSlideChange = null;
                    }
                }

                if (currentTime - lastSlideChangeTime < slideChangeThrottle) return;
                lastSlideChangeTime = currentTime;

                if (e.cancelable) e.preventDefault();
                if (this.options.direction === 'vertical') {
                    if (e.deltaY > 0) {
                        this._markUserInteraction();
                        this.slideNext();
                    } else {
                        this._markUserInteraction();
                        this.slidePrev();
                    }
                } else {
                    const delta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
                    if (delta > 0) {
                        this._markUserInteraction();
                        this.slideNext();
                    } else {
                        this._markUserInteraction();
                        this.slidePrev();
                    }
                }
            }
        };

        const scrollHandler = (e) => {
            const activeSlide = this.slides && this.slides[this.currentIndex];
            if (!activeSlide) return;

            let element = e.target;
            while (element && element !== document.body) {
                if (activeSlide.contains(element)) {
                    const isScrollable = element.scrollHeight > element.clientHeight;
                    if (isScrollable) {
                        const tolerance = 3;
                        const scrollTop = element.scrollTop;
                        const scrollHeight = element.scrollHeight;
                        const clientHeight = element.clientHeight;
                        const maxScroll = scrollHeight - clientHeight;

                        const isAtTop = scrollTop <= tolerance;
                        const isAtBottom = scrollTop >= maxScroll - tolerance;

                        if (isAtBottom && pendingSlideChange !== 'next') {
                            pendingSlideChange = 'next';
                        } else if (isAtTop && pendingSlideChange !== 'prev') {
                            pendingSlideChange = 'prev';
                        } else if (!isAtTop && !isAtBottom) {
                            pendingSlideChange = null;
                        }
                        break;
                    }
                }
                element = element.parentElement;
            }
        };

        this.container.addEventListener('wheel', handler, { passive: false });
        this.container.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
    }
    bindKeyboardEvent() {
        document.addEventListener('keydown', (e) => {
            if (this.options.direction === 'horizontal') {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this._markUserInteraction();
                    this.slideNext();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this._markUserInteraction();
                    this.slidePrev();
                }
            } else {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._markUserInteraction();
                    this.slideNext();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._markUserInteraction();
                    this.slidePrev();
                }
            }
        });
    }
    destroy() {


        this.stopAutoplay();

        const target = this.container;
        const isTouchEvent = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isPointerEvent = !!window.PointerEvent;
        const isMSPointerEvent = !!window.navigator.msPointerEnabled;

        const touchEvents = {
            start: isPointerEvent ? 'pointerdown' : isMSPointerEvent ? 'MSPointerDown' : 'touchstart',
            move: isPointerEvent ? 'pointermove' : isMSPointerEvent ? 'MSPointerMove' : 'touchmove',
            end: isPointerEvent ? 'pointerup' : isMSPointerEvent ? 'MSPointerUp' : 'touchend',
            cancel: isPointerEvent ? 'pointercancel' : isMSPointerEvent ? 'MSPointerCancel' : 'touchcancel'
        };

        if (this.touchHandlers) {
            target.removeEventListener(touchEvents.start, this.touchHandlers.start, false);
            target.removeEventListener(touchEvents.move, this.touchHandlers.move, false);
            target.removeEventListener(touchEvents.end, this.touchHandlers.end, false);
            target.removeEventListener(touchEvents.cancel, this.touchHandlers.cancel, false);
            document.removeEventListener(touchEvents.end, this.touchHandlers.documentEnd, false);
            document.removeEventListener(touchEvents.cancel, this.touchHandlers.documentEnd, false);

            if (!isTouchEvent) {
                target.removeEventListener('mousedown', this.touchHandlers.start, false);
                document.removeEventListener('mousemove', this.touchHandlers.move, false);
                document.removeEventListener('mouseup', this.touchHandlers.end, false);
            }
        }

        if (window.activeZhenshangyinSwiper === this) {
            window.activeZhenshangyinSwiper = null;
        }

        this.slides = null;
        this.wrapper = null;
        this.container = null;
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        window.removeEventListener('resize', this.handleResize);
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
        if (this.options.linkedGroup) {
            ZhenshangyinSwiper.removeFromLinkedGroup(this, this.options.linkedGroup);
        }
        if (this._onVisibilityChange) {
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
            this._onVisibilityChange = null;
        }
        if (this._pagerDelegates && Array.isArray(this._pagerDelegates)) {
            this._pagerDelegates.forEach(({ el, clickHandler, hoverHandler }) => {
                if (el && clickHandler) el.removeEventListener('click', clickHandler);
                if (el && hoverHandler) el.removeEventListener('mouseenter', hoverHandler, { capture: true });
            });
            this._pagerDelegates = [];
        }
    }
    checkBreakpoint() {
        const breakpoints = this.options.breakpoints;
        const windowWidth = window.innerWidth;
        const sortedBreakpoints = Object.keys(breakpoints)
            .map(key => parseInt(key))
            .sort((a, b) => b - a);
        let newBreakpoint = null;
        for (const width of sortedBreakpoints) {
            if (windowWidth <= width) {
                newBreakpoint = width;
            }
        }
        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;
            this.options = { ...this.originalOptions };
            if (newBreakpoint && breakpoints[newBreakpoint]) {
                this.options = {
                    ...this.options,
                    ...breakpoints[newBreakpoint]
                };
            }
        }
    }
    updateContainerHeight() {
        const activeSlide = this.slides[this.activeSlideIndex] || this.slides[0];
        if (activeSlide) {
            const img = activeSlide.querySelector('img');
            if (img) {
                if (img.complete && img.naturalHeight > 0) {
                    this.setContainerHeight(activeSlide);
                } else {
                    img.addEventListener('load', () => this.updateLayout(), { once: true });
                }
            } else {
                this.setContainerHeight(activeSlide);
            }
        }
    }
    setContainerHeight(slideEl) {
        slideEl.style.height = 'auto';
        const height = slideEl.offsetHeight;
        if (height > 0) {
            let containerHeight = height;
            if (this.options.direction === 'vertical' && this.options.slidesPerView > 1) {
                const totalGap = (this.options.spaceBetween || 0) * (this.options.slidesPerView - 1);
                containerHeight = height * this.options.slidesPerView + totalGap;
            }
            this.container.style.height = `${containerHeight}px`;
        }
        if (this.options.effect === 'fade') {
            this.slides.forEach(slide => {
                if (height > 0) {
                    slide.style.height = `${height}px`;
                }
            });
        }
    }
    initEventListeners() {
        this.container.addEventListener('click', (e) => {
        });

        if (this.options.linkedGroup && this.options.clickToSlide) {
            this.initClickToSlide();
        }
    }
    checkImagesLoaded() {
        const images = this.container.getElementsByTagName('img');
        Array.from(images).forEach(img => {
            if (!img.complete) {
                img.onload = () => { };
            }
        });
    }
    update() {
        this.updateLayout();
    }
    initMagnifier() {
        this.initFixedMagnifier();
    }

    initFixedMagnifier() {
        let magnifier = null;
        let selectionBox = null;
        try {
            const pos = window.getComputedStyle(this.container).position;
            if (!pos || pos === 'static') this.container.style.position = 'relative';
        } catch (_) { }
        const calculateMagnifierPosition = (containerRect, magnifierSize) => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const margin = this.options.magnifierMargin;
            const positions = [];
            const rightSpace = windowWidth - containerRect.right - margin;
            if (rightSpace >= magnifierSize) {
                positions.push({
                    position: 'right',
                    top: containerRect.top,
                    left: containerRect.right + margin
                });
            }
            const leftSpace = containerRect.left - margin;
            if (leftSpace >= magnifierSize) {
                positions.push({
                    position: 'left',
                    top: containerRect.top,
                    left: containerRect.left - magnifierSize - margin
                });
            }
            const bottomSpace = windowHeight - containerRect.bottom - margin;
            if (bottomSpace >= magnifierSize) {
                positions.push({
                    position: 'bottom',
                    top: containerRect.bottom + margin,
                    left: containerRect.left + (containerRect.width - magnifierSize) / 2
                });
            }
            const topSpace = containerRect.top - margin;
            if (topSpace >= magnifierSize) {
                positions.push({
                    position: 'top',
                    top: containerRect.top - magnifierSize - margin,
                    left: containerRect.left + (containerRect.width - magnifierSize) / 2
                });
            }
            if (positions.length === 0) {
                return {
                    position: 'right',
                    top: containerRect.top,
                    left: containerRect.right + margin
                };
            }
            const positionPriority = ['right', 'left', 'bottom', 'top'];
            for (const priority of positionPriority) {
                const position = positions.find(p => p.position === priority);
                if (position) return position;
            }

            return positions[0];
        };
        const createMagnifier = () => {
            if (!magnifier) {
                magnifier = document.createElement('div');
                magnifier.className = 'zhenshangyin-fixed-magnifier';
                const magnifierSize = this.options.fixedMagnifierSize || 400;
                magnifier.style.width = magnifierSize + 'px';
                magnifier.style.height = magnifierSize + 'px';
                document.body.appendChild(magnifier);
            }
            return magnifier;
        };
        const createSelectionBox = () => {
            if (!selectionBox && this.options.showSelectionBox) {
                const boxSize = this.options.selectionBoxSize ||
                    Math.floor(this.options.fixedMagnifierSize / this.options.zoomRatio);
                selectionBox = document.createElement('div');
                selectionBox.className = 'zhenshangyin-selection-box';
                selectionBox.style.width = boxSize + 'px';
                selectionBox.style.height = boxSize + 'px';
                selectionBox.style.position = 'absolute';
                selectionBox.style.pointerEvents = 'none';
                selectionBox.style.transform = 'translate(-50%, -50%)';
                selectionBox.style.margin = '0';
                selectionBox.style.boxSizing = 'border-box';
                this.container.appendChild(selectionBox);
            }
            return selectionBox;
        };
        const destroyMagnifier = () => {
            if (magnifier) {
                magnifier.remove();
                magnifier = null;
            }
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        };
        const bindFixedMagnifierEvents = (slide) => {
            const img = slide.querySelector('img');
            if (img) {
                slide.classList.add('zhenshangyin-magnifier-active');

                let slideSelectionBox = null;
                const createSlideSelectionBox = () => {
                    if (!slideSelectionBox && this.options.showSelectionBox) {
                        const boxSize = this.options.selectionBoxSize ||
                            Math.floor(this.options.fixedMagnifierSize / this.options.zoomRatio);
                        slideSelectionBox = document.createElement('div');
                        slideSelectionBox.className = 'zhenshangyin-selection-box';
                        slideSelectionBox.style.width = boxSize + 'px';
                        slideSelectionBox.style.height = boxSize + 'px';
                        slideSelectionBox.style.position = 'absolute';
                        slideSelectionBox.style.pointerEvents = 'none';
                        slideSelectionBox.style.transform = 'translate(-50%, -50%)';
                        slideSelectionBox.style.margin = '0';
                        slideSelectionBox.style.boxSizing = 'border-box';
                        slide.appendChild(slideSelectionBox);
                    }
                    return slideSelectionBox;
                };

                const destroySlideSelectionBox = () => {
                    if (slideSelectionBox) {
                        slideSelectionBox.remove();
                        slideSelectionBox = null;
                    }
                };

                const handleMouseMove = (e) => {
                    const mag = createMagnifier();
                    const box = createSlideSelectionBox();
                    const slideRect = slide.getBoundingClientRect();
                    const imgRect = img.getBoundingClientRect();
                    const containerRect = this.container.getBoundingClientRect();

                    let x = e.clientX - slideRect.left;
                    let y = e.clientY - slideRect.top;

                    const magnifierSize = this.options.fixedMagnifierSize || 400;
                    const imgOffsetX = imgRect.left - slideRect.left;
                    const imgOffsetY = imgRect.top - slideRect.top;

                    let boxSize = Math.floor(magnifierSize / (this.options.zoomRatio || 1));
                    if (box && box.offsetWidth) {
                        boxSize = box.offsetWidth;
                    } else if (this.options.selectionBoxSize) {
                        boxSize = this.options.selectionBoxSize;
                    }
                    const half = boxSize / 2;

                    const imgMinX = imgOffsetX + half;
                    const imgMaxX = imgOffsetX + imgRect.width - half;
                    const imgMinY = imgOffsetY + half;
                    const imgMaxY = imgOffsetY + imgRect.height - half;
                    const clampedX = Math.max(imgMinX, Math.min(imgMaxX, x));
                    const clampedY = Math.max(imgMinY, Math.min(imgMaxY, y));

                    if (box) {
                        box.style.left = clampedX + 'px';
                        box.style.top = clampedY + 'px';
                        box.style.display = 'block';
                    }
                    x = clampedX;
                    y = clampedY;

                    const position = calculateMagnifierPosition(containerRect, magnifierSize);
                    mag.style.top = position.top + 'px';
                    mag.style.left = position.left + 'px';
                    mag.style.backgroundImage = `url(${img.src})`;

                    const zoomRatio = boxSize > 0 ? (magnifierSize / boxSize) : this.options.zoomRatio;
                    const naturalW = img.naturalWidth || imgRect.width;
                    const naturalH = img.naturalHeight || imgRect.height;
                    const boxW = imgRect.width;
                    const boxH = imgRect.height;
                    const coverScale = Math.max(boxW / naturalW, boxH / naturalH);
                    const renderedW = naturalW * coverScale;
                    const renderedH = naturalH * coverScale;
                    const coverOffsetX = (renderedW - boxW) / 2;
                    const coverOffsetY = (renderedH - boxH) / 2;

                    mag.style.backgroundSize = `${renderedW * zoomRatio}px ${renderedH * zoomRatio}px`;

                    const xInImgBox = x - imgOffsetX;
                    const yInImgBox = y - imgOffsetY;
                    let backgroundX = -(xInImgBox + coverOffsetX) * zoomRatio + mag.offsetWidth / 2;
                    let backgroundY = -(yInImgBox + coverOffsetY) * zoomRatio + mag.offsetHeight / 2;

                    const bgW = renderedW * zoomRatio;
                    const bgH = renderedH * zoomRatio;
                    const minX = mag.offsetWidth - bgW;
                    const minY = mag.offsetHeight - bgH;
                    backgroundX = Math.min(0, Math.max(minX, backgroundX));
                    backgroundY = Math.min(0, Math.max(minY, backgroundY));

                    mag.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
                    mag.style.display = 'block';
                };
                slide.addEventListener('mouseenter', (e) => {
                    if (slide.classList.contains('zhenshangyin-slide-active')) {
                        const mag = createMagnifier();
                        const box = createSlideSelectionBox();
                        const slideRect = slide.getBoundingClientRect();
                        const containerRect = this.container.getBoundingClientRect();
                        if (box) {
                            const size = box.offsetWidth || (this.options.selectionBoxSize || Math.floor(this.options.fixedMagnifierSize / this.options.zoomRatio));
                            const half = size / 2;
                            let x = (e.clientX ?? (slideRect.left + slideRect.width / 2)) - slideRect.left;
                            let y = (e.clientY ?? (slideRect.top + slideRect.height / 2)) - slideRect.top;
                            const clampedX = Math.max(half, Math.min(slideRect.width - half, x));
                            const clampedY = Math.max(half, Math.min(slideRect.height - half, y));
                            box.style.left = clampedX + 'px';
                            box.style.top = clampedY + 'px';
                            box.style.display = 'block';
                        }
                        const magnifierSize = this.options.fixedMagnifierSize || 400;
                        const position = calculateMagnifierPosition(containerRect, magnifierSize);
                        mag.style.top = position.top + 'px';
                        mag.style.left = position.left + 'px';
                        mag.style.display = 'block';
                    }
                });
                slide.addEventListener('mousemove', handleMouseMove);
                slide.addEventListener('mouseleave', () => {
                    destroyMagnifier();
                    destroySlideSelectionBox();
                });
                this.wrapper.addEventListener('mousedown', () => {
                    destroyMagnifier();
                    destroySlideSelectionBox();
                });
            }
        };
        this.slides.forEach(slide => {
            bindFixedMagnifierEvents(slide);
        });
        if (this.options.loop) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList.contains('zhenshangyin-slide')) {
                            bindFixedMagnifierEvents(node);
                        }
                    });
                });
            });
            observer.observe(this.wrapper, {
                childList: true,
                subtree: true
            });
        }
        window.addEventListener('scroll', () => {
            if (magnifier && magnifier.style.display === 'block') {
                const containerRect = this.container.getBoundingClientRect();
                const magnifierSize = this.options.fixedMagnifierSize || 400;
                const position = calculateMagnifierPosition(containerRect, magnifierSize);
                magnifier.style.top = position.top + 'px';
                magnifier.style.left = position.left + 'px';
            }
        });
        window.addEventListener('resize', () => {
            if (magnifier && magnifier.style.display === 'block') {
                const containerRect = this.container.getBoundingClientRect();
                const magnifierSize = this.options.fixedMagnifierSize || 400;
                const position = calculateMagnifierPosition(containerRect, magnifierSize);
                magnifier.style.top = position.top + 'px';
                magnifier.style.left = position.left + 'px';
            }
        });
    }
    initTouchEvents() {
        const target = this.container;
        const touchRatio = 1;
        const touchAngle = 45;
        const simulateTouch = true;
        const longSwipesRatio = 0.5;
        const longSwipesMs = 300;
        const followFinger = true;
        const touchMoveStopPropagation = true;
        const touchStartPreventDefault = true;
        const resistanceRatio = 0.85;
        const maxEdgePullRatio = 0.4;

        const isTouchEvent = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isPointerEvent = !!window.PointerEvent;
        const isMSPointerEvent = !!window.navigator.msPointerEnabled;

        let lastMoveTime = 0;
        let lastMoveTranslate = 0;
        let velocityHistory = [];

        const handleTouchStart = (e) => {
            if (this.isAnimatingRAF) {
                cancelAnimationFrame(this.rafId);
                this.isAnimatingRAF = false;
            }

            if (this.isAnimating) {
                return;
            }

            if (touchStartPreventDefault) {
                e.preventDefault();
            }

            this.touchStartTime = Date.now();
            this.allowClick = true;
            this.isTouched = true;
            this.isMoved = false;
            this.isScrolling = undefined;
            this.touchesDirection = undefined;
            velocityHistory = [];
            this._touchEndProcessed = false;

            let x, y;
            if (isTouchEvent && e.type === 'touchstart') {
                x = e.targetTouches[0].pageX;
                y = e.targetTouches[0].pageY;
            } else {
                x = e.pageX || e.clientX;
                y = e.pageY || e.clientY;
            }

            this.touchStartX = x;
            this.touchStartY = y;

            const transformMatrix = window.getComputedStyle(this.wrapper).getPropertyValue('transform');
            if (transformMatrix && transformMatrix !== 'none') {
                const matrix = new DOMMatrix(transformMatrix);
                this.touchStartTranslate = this.options.direction === 'horizontal'
                    ? matrix.m41
                    : matrix.m42;
            } else {
                this.touchStartTranslate = 0;
            }

            this.calculateTranslateLimits();
            this.currentTranslate = this.touchStartTranslate;
            this.latestTranslate = this.currentTranslate;
            lastMoveTime = Date.now();
            lastMoveTranslate = this.currentTranslate;

            window.activeZhenshangyinSwiper = this;

            if (this.options.autoplay && !this.manuallyPaused) {
                this.stopAutoplay();
            }

            if (typeof bindTouchMove === 'function') {
                bindTouchMove();
            }

            this.onTouchStart(e);
        };

        const handleTouchMove = (e) => {
            if (!this.isTouched || window.activeZhenshangyinSwiper !== this) {
                return;
            }

            const shouldDisableTouch = !this.options.loop && !this.options.centeredSlides &&
                this.slides.length <= this.options.slidesPerView;

            if (touchMoveStopPropagation) {
                e.stopPropagation();
            }
            let x, y;
            if (isTouchEvent && e.type === 'touchmove') {
                x = e.targetTouches[0].pageX;
                y = e.targetTouches[0].pageY;
            } else {
                x = e.pageX || e.clientX;
                y = e.pageY || e.clientY;
            }
            try {
                const cx = (isTouchEvent && e.type === 'touchmove')
                    ? (e.targetTouches[0]?.clientX)
                    : (e.clientX ?? x);
                const cy = (isTouchEvent && e.type === 'touchmove')
                    ? (e.targetTouches[0]?.clientY)
                    : (e.clientY ?? y);
                const rect = this.container?.getBoundingClientRect?.();
                if (rect && (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom)) {
                    if (typeof handleTouchEnd === 'function') {
                        handleTouchEnd(e);
                    }
                    return;
                }
            } catch (_) {
            }
            this.touchMoveX = x;
            this.touchMoveY = y;
            this.touchDiffX = this.touchMoveX - this.touchStartX;
            this.touchDiffY = this.touchMoveY - this.touchStartY;

            if (typeof this.isScrolling === 'undefined') {
                const absDiffX = Math.abs(this.touchDiffX);
                const absDiffY = Math.abs(this.touchDiffY);
                if (absDiffX > 5 || absDiffY > 5) {
                    this.isScrolling = this.options.direction === 'horizontal'
                        ? absDiffY > absDiffX
                        : absDiffX > absDiffY;

                }
            }

            if (this.isScrolling) {
                this.isTouched = false;
                return;
            }

            if (shouldDisableTouch) {
                this.isMoved = false;
                if (e.cancelable) {
                    e.preventDefault();
                }
                return;
            }

            if (e.cancelable) {
                e.preventDefault();
            }

            let diff = this.options.direction === 'horizontal' ? this.touchDiffX : this.touchDiffY;
            diff = diff * touchRatio;

            this.touchesDirection = diff > 0 ? 'prev' : 'next';

            if (!this.isMoved) {
                this.isMoved = true;
                const moveThreshold = 10;
                if (Math.abs(diff) > moveThreshold) {
                    this.allowClick = false;
                }
            }

            const now = Date.now();
            const timeDiff = now - lastMoveTime;

            if (timeDiff > 0) {
                const translateDiff = this.currentTranslate - lastMoveTranslate;
                const instantVelocity = translateDiff / timeDiff;
                velocityHistory.push(instantVelocity);
                if (velocityHistory.length > 5) {
                    velocityHistory.shift();
                }
                lastMoveTime = now;
                lastMoveTranslate = this.currentTranslate;
            }

            let newTranslate = this.touchStartTranslate + diff;

            if (!this.options.loop) {
                if (newTranslate > this.maxTranslate) {
                    const overDiff = newTranslate - this.maxTranslate;
                    newTranslate = this.maxTranslate + overDiff * 0.4;
                } else if (newTranslate < this.minTranslate) {
                    const overDiff = this.minTranslate - newTranslate;
                    newTranslate = this.minTranslate - overDiff * 0.4;
                }
            }

            this.currentTranslate = newTranslate;

            if (followFinger) {
                this.latestTranslate = newTranslate;
                if (!this.isAnimatingRAF) {
                    this.isAnimatingRAF = true;
                    this.rafId = requestAnimationFrame(this.applyTransform.bind(this));
                }
            }

            this.onTouchMove(e);
        };

        const handleTouchEnd = (e) => {
            if (this._touchEndProcessed) {
                return;
            }
            this._touchEndProcessed = true;

            if (this.isAnimatingRAF) {
                cancelAnimationFrame(this.rafId);
                this.isAnimatingRAF = false;
            }

            if (!this.isTouched || window.activeZhenshangyinSwiper !== this) {
                if (typeof unbindTouchMove === 'function') {
                    unbindTouchMove();
                }
                this.allowClick = false;
                return;
            }

            const wasMoved = this.isMoved;

            this.isTouched = false;
            this.isMoved = false;

            if (typeof unbindTouchMove === 'function') {
                unbindTouchMove();
            }

            if (!wasMoved) {
                this.allowClick = true;
                if (this.options.autoplay && !this.manuallyPaused) {
                    this.startAutoplay();
                }
                return;
            }

            this.allowClick = false;

            window.activeZhenshangyinSwiper = null;

            this.touchEndTime = Date.now();
            const timeDiff = this.touchEndTime - this.touchStartTime;

            let avgVelocity = 0;
            if (velocityHistory.length > 0) {
                avgVelocity = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;
            }

            const diff = this.options.direction === 'horizontal' ? this.touchDiffX : this.touchDiffY;
            this.velocity = Math.abs(avgVelocity);
            this.swipeDirection = diff > 0 ? 'prev' : 'next';

            const moveDistance = Math.sqrt(
                Math.pow(this.touchDiffX, 2) + Math.pow(this.touchDiffY, 2)
            );
            if (moveDistance <= 5) {
                this.allowClick = true;
            }

            this.restoreAllowClickAfterTouch();

            this.wrapper.style.transition = `transform ${this.options.speed / 1000}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

            const translateDiff = this.currentTranslate - this.touchStartTranslate;
            const absDiff = Math.abs(translateDiff);

            let slideSize = this.getSlideSize();
            const slideSpacing = this.options.spaceBetween || 0;
            const totalSlideSize = slideSize + slideSpacing;

            let slidesToMove = 0;

            if (absDiff > totalSlideSize * 0.15 || this.velocity > this.options.velocityThreshold) {
                slidesToMove = Math.max(1, Math.round(absDiff / totalSlideSize));

                if (this.velocity > this.options.velocityThreshold * 2) {
                    slidesToMove = Math.min(slidesToMove + 1, 3);
                }

                if (this.swipeDirection === 'prev') {
                    slidesToMove = -slidesToMove;
                }
            }

            if (slidesToMove === 0) {
                this.restorePosition();
                if (this.options.autoplay && !this.manuallyPaused) {
                    this.startAutoplay();
                }
                this.onTouchEnd(e);
                return;
            }

            let targetIndex = this.currentIndex + slidesToMove;
            let forceDirection = false;

            if (this.options.loop) {

                if (absDiff > totalSlideSize || Math.abs(slidesToMove) > 1) {
                    forceDirection = true;
                }
            } else {
                targetIndex = Math.max(0, Math.min(targetIndex, this.slides.length - 1));

                if (this.options.slidesPerView === 'auto' && !this.options.centeredSlides) {
                    const maxIndex = this.getAutoMaxIndex();
                    targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
                } else if (this.options.slidesPerView > 1 && !this.options.centeredSlides) {
                    const maxIndex = this.slides.length - this.options.slidesPerView;
                    targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
                }
            }

            this.slideTo(targetIndex, false, forceDirection);

            if (this.options.autoplay && !this.manuallyPaused) {
                this.startAutoplay();
            }

            this.onTouchEnd(e);
        };

        const handleDocumentTouchEnd = (e) => {
            if (window.activeZhenshangyinSwiper === this) {
                handleTouchEnd(e);
            }
        };

        const touchEvents = {
            start: isPointerEvent ? 'pointerdown' : isMSPointerEvent ? 'MSPointerDown' : 'touchstart',
            move: isPointerEvent ? 'pointermove' : isMSPointerEvent ? 'MSPointerMove' : 'touchmove',
            end: isPointerEvent ? 'pointerup' : isMSPointerEvent ? 'MSPointerUp' : 'touchend',
            cancel: isPointerEvent ? 'pointercancel' : isMSPointerEvent ? 'MSPointerCancel' : 'touchcancel'
        };

        target.addEventListener(touchEvents.start, handleTouchStart, false);
        let touchMoveHandler = null;
        let touchEndHandler = null;

        const bindTouchMove = () => {
            if (!touchMoveHandler) {
                touchMoveHandler = handleTouchMove.bind(this);
                document.addEventListener(touchEvents.move, touchMoveHandler, { passive: false });
                if (simulateTouch && !isTouchEvent) {
                    document.addEventListener('mousemove', touchMoveHandler, { passive: false });
                }
            }
        };

        const unbindTouchMove = () => {
            if (touchMoveHandler) {
                document.removeEventListener(touchEvents.move, touchMoveHandler, { passive: false });
                if (simulateTouch && !isTouchEvent) {
                    document.removeEventListener('mousemove', touchMoveHandler, { passive: false });
                }
                touchMoveHandler = null;
            }
        };

        target.addEventListener(touchEvents.end, handleTouchEnd, false);
        target.addEventListener(touchEvents.cancel, handleTouchEnd, false);

        document.addEventListener(touchEvents.end, handleDocumentTouchEnd, false);
        document.addEventListener(touchEvents.cancel, handleDocumentTouchEnd, false);

        if (simulateTouch && !isTouchEvent) {
            target.addEventListener('mousedown', handleTouchStart, false);
        }

        if (!isTouchEvent) {
            target.addEventListener('mouseleave', (e) => {
                if (window.activeZhenshangyinSwiper === this && this.isTouched) {
                    handleTouchEnd(e);
                }
            }, false);
        }

        target.addEventListener('click', (e) => {
            if (!this.allowClick) {
                const clickedElement = e.target.tagName === 'A' ? e.target : e.target.closest('a');
                if (clickedElement) {
                    const moveDistance = Math.sqrt(
                        Math.pow(this.touchDiffX, 2) + Math.pow(this.touchDiffY, 2)
                    );
                    if (moveDistance <= 5) {
                        return true;
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        document.addEventListener('click', (e) => {
            if (this.allowClick === false && this.container.contains(e.target)) {
                const clickedElement = e.target.tagName === 'A' ? e.target : e.target.closest('a');
                if (clickedElement) {
                    const moveDistance = Math.sqrt(
                        Math.pow(this.touchDiffX, 2) + Math.pow(this.touchDiffY, 2)
                    );
                    if (moveDistance <= 5) {
                        this.allowClick = true;
                        return true;
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            if (window.activeZhenshangyinSwiper !== this) {
                this.allowClick = true;
                this.isTouched = false;
                this.isMoved = false;
            }
        }, true);

        this.touchHandlers = {
            start: handleTouchStart,
            move: handleTouchMove,
            end: handleTouchEnd,
            cancel: handleTouchEnd,
            documentEnd: handleDocumentTouchEnd
        };
    }

    applyTransform() {
        if (this.wrapper) {
            this.wrapper.style.transition = 'none';
            const transform = this.options.direction === 'horizontal' ?
                `translate3d(${this.latestTranslate}px, 0, 0)` :
                `translate3d(0, ${this.latestTranslate}px, 0)`;
            this.wrapper.style.transform = transform;
        }
        this.isAnimatingRAF = false;
    }

    getAutoMaxIndex() {
        const isAuto = this.options.slidesPerView === 'auto';
        if (!isAuto) return Math.max(0, this.slides.length - 1);
        if (!this.container || !this.slides || this.slides.length === 0) return 0;

        if (this.options.linkedGroup) return Math.max(0, this.slides.length - 1);
        if (this.options.centeredSlides) return Math.max(0, this.slides.length - 1);

        const containerRect = this.container.getBoundingClientRect();
        const containerSize = this.options.direction === 'horizontal'
            ? containerRect.width
            : containerRect.height;

        const slideRect = this.slides[0].getBoundingClientRect();
        const slideSize = this.options.direction === 'horizontal'
            ? slideRect.width
            : slideRect.height;
        const slideStep = slideSize + (this.options.spaceBetween || 0);

        if (!containerSize || !slideStep) return Math.max(0, this.slides.length - 1);

        const visibleSlides = Math.max(1, Math.floor(containerSize / slideStep));
        return Math.max(0, this.slides.length - visibleSlides);
    }

    calculateTranslateLimits() {
        if (this.options.loop) {
            this.minTranslate = -Infinity;
            this.maxTranslate = Infinity;
            return;
        }

        const containerSize = this.options.direction === 'horizontal'
            ? this.container.offsetWidth
            : this.container.offsetHeight;

        if (this.options.slidesPerView === "auto") {
            let totalSize = 0;

            this.slides.forEach((slide, index) => {
                const rect = slide.getBoundingClientRect();
                totalSize += this.options.direction === 'horizontal' ? rect.width : rect.height;
                if (index < this.slides.length - 1) {
                    totalSize += this.options.spaceBetween;
                }
            });

            if (this.options.centeredSlides) {
                const firstSlideRect = this.slides[0].getBoundingClientRect();
                const firstSlideSize = this.options.direction === 'horizontal'
                    ? firstSlideRect.width
                    : firstSlideRect.height;
                const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                let centerOffset = (containerSize - firstSlideSize) / 2;
                if (mode === 'pair') {
                    const second = this.slides[1];
                    if (second) {
                        const secondRect = second.getBoundingClientRect();
                        const secondSize = this.options.direction === 'horizontal'
                            ? secondRect.width
                            : secondRect.height;
                        const pairSize = firstSlideSize + this.options.spaceBetween + secondSize;
                        centerOffset = (containerSize - pairSize) / 2;
                    }
                }

                this.maxTranslate = centerOffset;
                this.minTranslate = -(totalSize - containerSize + centerOffset);
            } else {
                this.maxTranslate = 0;
                this.minTranslate = -(totalSize - containerSize);
            }
        } else {
            const totalGap = this.options.spaceBetween * (Math.min(this.options.slidesPerView, this.slides.length) - 1);
            const availableSpace = containerSize - totalGap;
            const slideSize = availableSpace / this.options.slidesPerView;
            const totalOffset = slideSize + this.options.spaceBetween;

            if (this.options.centeredSlides) {
                const mode = this.options?.transforms?.scale?.centerMode === 'pair' ? 'pair' : 'single';
                const centerOffset = mode === 'pair'
                    ? (containerSize - (2 * slideSize + this.options.spaceBetween)) / 2
                    : (containerSize - slideSize) / 2;
                const maxIndex = this.slides.length - 1;

                this.maxTranslate = centerOffset;
                this.minTranslate = -(maxIndex * totalOffset - centerOffset);
            } else {
                const maxIndex = this.slides.length - this.options.slidesPerView;

                this.maxTranslate = 0;
                this.minTranslate = -(maxIndex * totalOffset);
            }
        }
    }

    getSlideSize() {
        if (this.options.slidesPerView === "auto") {
            if (!this.slides || this.slides.length === 0) return 0;

            return this.options.direction === 'horizontal'
                ? this.slides[0].offsetWidth
                : this.slides[0].offsetHeight;
        } else {
            const containerSize = this.options.direction === 'horizontal'
                ? this.container.offsetWidth
                : this.container.offsetHeight;
            const totalGap = this.options.spaceBetween * (Math.min(this.options.slidesPerView, this.slides.length) - 1);
            const availableSpace = containerSize - totalGap;
            return availableSpace / this.options.slidesPerView;
        }
    }

    restorePosition(animated = false) {
        if (animated) {
            this.wrapper.style.transition = `transform ${this.options.speed / 1000}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }

        if (this.options.direction === 'horizontal') {
            this.wrapper.style.transform = `translate3d(${this.touchStartTranslate}px, 0, 0)`;
        } else {
            this.wrapper.style.transform = `translate3d(0, ${this.touchStartTranslate}px, 0)`;
        }

        if (!this.options.loop && !this.options.centeredSlides) {
            const containerSize = this.options.direction === 'horizontal'
                ? this.container.offsetWidth
                : this.container.offsetHeight;

            if (this.options.slidesPerView === "auto") {
                const slideRects = this.slides.map(slide => slide.getBoundingClientRect());
                let currentOffset = Math.abs(this.touchStartTranslate);
                let totalOffset = 0;
                let activeIndex = 0;

                for (let i = 0; i < this.slides.length; i++) {
                    const slideSize = this.options.direction === 'horizontal'
                        ? slideRects[i].width
                        : slideRects[i].height;

                    if (totalOffset + slideSize / 2 > currentOffset) {
                        activeIndex = i;
                        break;
                    }

                    totalOffset += slideSize + this.options.spaceBetween;
                }

                this.activeSlideIndex = activeIndex;
            } else {
                const totalGap = this.options.spaceBetween * (Math.min(this.options.slidesPerView, this.slides.length) - 1);
                const availableSpace = containerSize - totalGap;
                const slideSize = availableSpace / this.options.slidesPerView;
                const totalOffset = slideSize + this.options.spaceBetween;

                const currentOffset = Math.abs(this.touchStartTranslate);
                const activeIndex = Math.round(currentOffset / totalOffset);

                this.activeSlideIndex = Math.min(activeIndex, this.slides.length - 1);
            }

            this.slides.forEach((slide, i) => {
                if (slide && slide.classList) {
                    slide.classList.toggle('zhenshangyin-slide-active', i === this.activeSlideIndex);
                }
            });

            this.updatePaginationState();
            this.updateNavigationState();
        }
    }

    onTouchStart(event) {
        if (this.options.on.touchStart) {
            this.options.on.touchStart(this, event, {
                touchStartX: this.touchStartX,
                touchStartY: this.touchStartY,
                touchStartTranslate: this.touchStartTranslate
            });
        }
    }

    onTouchMove(event) {
        if (this.options.on.touchMove) {
            this.options.on.touchMove(this, event, {
                touchStartX: this.touchStartX,
                touchStartY: this.touchStartY,
                touchMoveX: this.touchMoveX,
                touchMoveY: this.touchMoveY,
                touchDiffX: this.touchDiffX,
                touchDiffY: this.touchDiffY,
                currentTranslate: this.currentTranslate,
                touchStartTranslate: this.touchStartTranslate
            });
        }
    }

    onTouchEnd(event) {
        if (this.options.on.touchEnd) {
            this.options.on.touchEnd(this, event, {
                velocity: this.velocity,
                touchStartTranslate: this.touchStartTranslate,
                currentTranslate: this.currentTranslate,
                swipeDirection: this.swipeDirection
            });
        }
    }

    initClickToSlide() {
        if (!this.slides || !this.slides.length) return;

        this.slides.forEach((slide, index) => {
            if (!slide) return;

            slide.addEventListener('click', (e) => {
                e.stopPropagation();

                if (this.isAnimating) {
                    e.preventDefault();
                    return;
                }

                const clickedElement = e.target;
                if (clickedElement.tagName === 'A' ||
                    clickedElement.tagName === 'BUTTON' ||
                    clickedElement.closest('a') ||
                    clickedElement.closest('button') ||
                    clickedElement.closest('.zhenshangyin-navigation') ||
                    clickedElement.closest('.zhenshangyin-pagination')) {
                    return;
                }

                let targetIndex;
                if (this.options.loop && this.slides.length) {
                    const slideCount = this.slides.length / 3;
                    const clickedRealIndex = index % slideCount;
                    const currentRealIndex = this.currentIndex % slideCount;

                    let diff = clickedRealIndex - currentRealIndex;
                    if (Math.abs(diff) > slideCount / 2) {
                        diff = diff > 0 ? diff - slideCount : diff + slideCount;
                    }

                    targetIndex = this.currentIndex + diff;

                    if (targetIndex < 0) {
                        targetIndex += slideCount;
                    } else if (targetIndex >= this.slides.length) {
                        targetIndex -= slideCount;
                    }
                } else {
                    targetIndex = Math.min(index, this.slides.length - 1);
                }

                const allowResnapWhenActive = !!(
                    this.options.linkedGroup &&
                    !this.options.loop &&
                    !this.options.centeredSlides &&
                    typeof this.options.slidesPerView === 'number' &&
                    this.options.slidesPerView > 1
                );

                if (targetIndex !== this.currentIndex) {
                    this._isClicking = true;
                    this._markUserInteraction();
                    this.slideTo(targetIndex);
                }
            });
        });
    }

    on(event, callback) {
        if (!this.options.on) {
            this.options.on = {};
        }
        this.options.on[event] = callback;
    }

    off(event) {
        if (this.options.on && this.options.on[event]) {
            delete this.options.on[event];
        }
    }

    isTransformsEnabled() {
        return this.options && this.options.transforms && (
            this.options.transforms.scale?.enabled ||
            this.options.transforms.translate?.enabled ||
            this.options.transforms.rotate?.enabled ||
            this.options.transforms.skew?.enabled ||
            this.options.transforms.opacity?.enabled ||
            this.options.transforms.filter?.enabled
        );
    }

    initTransformEffects() {
        if (this._transformsInitialized) {
            if (this.updateTransforms) {
                this.updateTransforms();
            }
            return;
        }
        this._transformsInitialized = true;

        const { transforms } = this.options;
        if (transforms.perspective.enabled && transforms.perspective.value) {
            this.container.style.perspective = `${transforms.perspective.value}px`;
        }

        this.slides.forEach((slide, index) => {
            if (transforms.backfaceVisibility && transforms.backfaceVisibility.enabled) {
                slide.style.backfaceVisibility = transforms.backfaceVisibility.value;
            }
            this.applyTransforms(slide, index);
        });

        const originalSlideTo = this.slideTo;
        this.slideTo = (index, noTransition = false, forceDirection = false) => {
            this.slides.forEach((slide, i) => {
                slide.style.transition = noTransition ?
                    'none' :
                    `all ${this.options.speed}ms ease`;
            });

            originalSlideTo.call(this, index, noTransition, forceDirection);

            this.updateTransforms();
        };

        this.on('transitionStart', () => {
            this.updateTransforms();
        });

        this.on('transitionEnd', () => {
            setTimeout(() => {
                this.updateTransforms();
            }, 10);
        });

        this.on('slideChange', () => {
            this.updateTransforms();
        });

        const originalUpdateSlides = this.updateSlides;
        this.updateSlides = function () {
            const isLoopJump = this.wrapper.style.transition === 'none';

            if (isLoopJump && this.options.loop) {
                this.slides.forEach(slide => {
                    slide.style.transition = 'none';
                });
            }

            originalUpdateSlides.call(this);

            if (isLoopJump && this.options.loop) {
                this.updateTransforms();
                this.wrapper.offsetHeight;
                setTimeout(() => {
                    this.slides.forEach(slide => {
                        slide.style.transition = `all ${this.options.speed}ms ease`;
                    });
                }, 0);
            }
        };

        if (this.options.slidesPerView === 'auto' && this.options.centeredSlides) {
            this.fixCenteredAutoSlides();
        }
        this.forceCenter();

        setTimeout(() => {
            this.initializeAnimations();
        }, 100);
    }

    updateTransformsDuringTouch(touchData) {
        const {
            touchStartTranslate,
            currentTranslate
        } = touchData;
        const translateDiff = currentTranslate - touchStartTranslate;

        let slideSize = this.getSlideSize() + this.options.spaceBetween;
        if (slideSize <= 0) slideSize = 1;

        const slidesMoved = translateDiff / slideSize;

        const virtualIndex = this._transformTouchData.touchStartIndex - slidesMoved;

        this.slides.forEach((slide, index) => {
            this.applyTransformsWithFractionalIndex(slide, index, virtualIndex);
        });

        if (this.options.slidesPerView === 'auto' && this.options.centeredSlides) {
            const containerWidth = this.container.offsetWidth;

            const lowerIndex = Math.max(0, Math.min(this.slides.length - 1, Math.floor(virtualIndex)));
            const upperIndex = Math.max(0, Math.min(this.slides.length - 1, Math.ceil(virtualIndex)));
            const indexFraction = virtualIndex - lowerIndex;

            const lowerSlide = this.slides[lowerIndex];
            const upperSlide = this.slides[upperIndex];
            if (!lowerSlide || !upperSlide) return;

            const lowerSlideWidth = parseFloat(window.getComputedStyle(lowerSlide).width);
            const upperSlideWidth = parseFloat(window.getComputedStyle(upperSlide).width);
            const virtualSlideWidth = lowerSlideWidth + (upperSlideWidth - lowerSlideWidth) * indexFraction;

            const lowerSlideOffsetLeft = lowerSlide.offsetLeft;
            const upperSlideOffsetLeft = upperSlide.offsetLeft;
            const virtualOffsetLeft = lowerSlideOffsetLeft + (upperSlideOffsetLeft - lowerSlideOffsetLeft) * indexFraction;

            const targetTranslateX = (containerWidth / 2) - virtualOffsetLeft - (virtualSlideWidth / 2);

            this.wrapper.style.transition = 'none';
            this.wrapper.style.transform = `translateX(${targetTranslateX}px)`;
        }
    }

    scaleAt(distance) {
        const { transforms } = this.options || {};
        if (transforms && transforms.scale && transforms.scale.enabled) {
            const d = Math.max(0, distance);
            const scaleCfg = transforms.scale || {};
            const step = typeof scaleCfg.step === 'number' ? scaleCfg.step : 0;
            return Math.max(0, 1 - step * d);
        }
        return 1;
    }

    getScaleCenterMode() {
        const mode = this.options?.transforms?.scale?.centerMode;
        return mode === 'pair' ? 'pair' : 'single';
    }

    getPairCenterIndex() {
        return (this.currentIndex || 0) + 0.5;
    }

    getTransformPositionAndDistance(index, centerIndex) {
        const mode = this.getScaleCenterMode();
        const c = typeof centerIndex === 'number'
            ? centerIndex
            : (mode === 'pair' ? this.getPairCenterIndex() : (this.currentIndex || 0));

        const position = index - c;
        let distance = Math.abs(position);
        if (mode === 'pair') {
            distance = Math.max(0, distance - 0.5);
        }
        return { position, distance, centerIndex: c };
    }

    stepValue(base, distance) {
        const d = Math.max(0, distance);
        return base * d;
    }

    parseUnitToPx(value, baseWidth = 0) {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            const match = trimmed.match(/^(-?\d*\.?\d+)(px|%|vw|vh|em|rem)?$/i);

            if (!match) {
                const num = parseFloat(trimmed);
                return isNaN(num) ? 0 : num;
            }

            const numValue = parseFloat(match[1]);
            const unit = (match[2] || 'px').toLowerCase();

            switch (unit) {
                case 'px':
                    return numValue;
                case '%':
                    return (baseWidth * numValue) / 100;
                case 'vw':
                    return (window.innerWidth * numValue) / 100;
                case 'vh':
                    return (window.innerHeight * numValue) / 100;
                case 'em':
                case 'rem':
                    const rootFontSize = unit === 'rem'
                        ? parseFloat(getComputedStyle(document.documentElement).fontSize)
                        : parseFloat(getComputedStyle(this.container || document.body).fontSize);
                    return numValue * (rootFontSize || 16);
                default:
                    return numValue;
            }
        }

        return 0;
    }

    computeUniformSpacingOffset(distance, position, customSpacingStartIndex = 0) {
        const transforms = this.options && this.options.transforms ? this.options.transforms : {};
        const uniformSpacing = transforms.uniformSpacing || {};
        const gap = typeof uniformSpacing.gap === 'number' ? uniformSpacing.gap : 0;
        const customSpacing = uniformSpacing.customSpacing;

        const baseWidth = this.getSlideSize ? this.getSlideSize() : 0;
        const baseStep = baseWidth + (this.options && this.options.spaceBetween ? this.options.spaceBetween : 0);

        const containerWidth = this.containerWidth || (this.container ? this.container.getBoundingClientRect().width : window.innerWidth);
        const referenceWidth = baseWidth || containerWidth;

        if (customSpacing && Array.isArray(customSpacing) && customSpacing.length > 0) {
            const pFloor = Math.floor(distance);
            let offset = 0;

            for (let i = 0; i < pFloor; i++) {
                const s0 = this.scaleAt(i);
                const s1 = this.scaleAt(i + 1);
                const idx = Math.max(0, customSpacingStartIndex + i);
                const customGapValue = idx < customSpacing.length ? customSpacing[idx] : customSpacing[customSpacing.length - 1];
                const customGap = this.parseUnitToPx(customGapValue, referenceWidth);
                const desiredStep = (baseWidth * 0.5 * (s0 + s1)) + customGap;
                offset += desiredStep - baseStep;
            }

            const frac = distance - pFloor;
            if (frac > 0) {
                const s0 = this.scaleAt(pFloor);
                const s1 = this.scaleAt(pFloor + 1);
                const idx = Math.max(0, customSpacingStartIndex + pFloor);
                const customGapValue = idx < customSpacing.length ? customSpacing[idx] : customSpacing[customSpacing.length - 1];
                const customGap = this.parseUnitToPx(customGapValue, referenceWidth);
                const desiredStep = (baseWidth * 0.5 * (s0 + s1)) + customGap;
                offset += (desiredStep - baseStep) * frac;
            }

            return offset * Math.sign(position || 0);
        }

        const pFloor = Math.floor(distance);
        let offset = 0;
        for (let i = 0; i < pFloor; i++) {
            const s0 = this.scaleAt(i);
            const s1 = this.scaleAt(i + 1);
            const desiredStep = (baseWidth * 0.5 * (s0 + s1)) + gap;
            offset += desiredStep - baseStep;
        }
        const frac = distance - pFloor;
        if (frac > 0) {
            const s0 = this.scaleAt(pFloor);
            const s1 = this.scaleAt(pFloor + 1);
            const desiredStep = (baseWidth * 0.5 * (s0 + s1)) + gap;
            offset += (desiredStep - baseStep) * frac;
        }
        return offset * Math.sign(position || 0);
    }

    applyTransformsWithFractionalIndex(slide, index, virtualIndex) {
        const { transforms } = this.options;

        const mode = this.getScaleCenterMode();
        const centerIndex = mode === 'pair' ? (virtualIndex + 0.5) : virtualIndex;

        let distance;
        let position;
        position = index - centerIndex;
        const rawDistance = Math.abs(position);
        distance = rawDistance;
        if (mode === 'pair') {
            distance = Math.max(0, distance - 0.5);
        }

        let transform = '';
        let filter = '';

        let translateX = 0, translateY = 0, translateZ = 0;
        if (transforms.uniformSpacing && transforms.uniformSpacing.enabled) {
            if (mode === 'pair') {
                const uniformSpacing = transforms.uniformSpacing || {};
                const baseWidth = this.getSlideSize ? this.getSlideSize() : 0;
                const containerWidth = this.containerWidth || (this.container ? this.container.getBoundingClientRect().width : window.innerWidth);
                const referenceWidth = baseWidth || containerWidth;
                const customSpacing = uniformSpacing.customSpacing;
                const gapBase = typeof uniformSpacing.gap === 'number' ? uniformSpacing.gap : 0;
                const centerGapPx = (customSpacing && Array.isArray(customSpacing) && customSpacing.length > 0)
                    ? this.parseUnitToPx(customSpacing[0], referenceWidth)
                    : gapBase;
                if (centerGapPx) {
                    const clampedPos = Math.max(-0.5, Math.min(0.5, position || 0));
                    const t = clampedPos / 0.5;
                    translateX += (centerGapPx / 2) * t;
                }
                const d = Math.max(0, rawDistance - 0.5);
                if (d > 0) {
                    translateX += this.computeUniformSpacingOffset(d, position, 1);
                }
            } else {
                translateX += this.computeUniformSpacingOffset(rawDistance, position);
            }
        }

        if (transforms.translate.enabled) {
            translateX += this.stepValue(transforms.translate.x, distance);
            translateY += this.stepValue(transforms.translate.y, distance);
            translateZ += this.stepValue(transforms.translate.z, distance);
        }
        if (transforms.scale && transforms.scale.enabled) {
            const depthBoost = Math.max(0, 0 - (distance * 5));
            translateZ += depthBoost;
        }
        if (translateX !== 0 || translateY !== 0 || translateZ !== 0) {
            transform += ` translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`;
        }

        if (transforms.scale.enabled) {
            const scale = this.scaleAt(distance);
            transform += ` scale(${scale})`;
        }

        if (transforms.rotate.enabled) {
            const x = this.stepValue(transforms.rotate.x, distance);
            const y = this.stepValue(transforms.rotate.y, distance) * -Math.sign(position);
            const z = this.stepValue(transforms.rotate.z, distance) * Math.sign(position);
            transform += ` rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        }

        if (transforms.skew.enabled) {
            const x = this.stepValue(transforms.skew.x, distance) * Math.sign(position);
            const y = this.stepValue(transforms.skew.y, distance) * Math.sign(position);
            transform += ` skew(${x}deg, ${y}deg)`;
        }

        if (transforms.opacity.enabled) {
            const ocfg = transforms.opacity || {};
            const step = typeof ocfg.step === 'number' ? ocfg.step : 0;
            const opacity = Math.max(0, Math.min(1, 1 - step * distance));
            slide.style.opacity = opacity;
        }

        if (transforms.filter.enabled) {
            const fcfg = transforms.filter || {};
            const blur = (fcfg.blur || 0) * distance;
            const brightness = 100 + (fcfg.brightness || 0) * distance;
            const contrast = 100 + (fcfg.contrast || 0) * distance;
            const grayscale = Math.max(0, Math.min(100, (fcfg.grayscale || 0) * distance));
            const hueRotate = (fcfg.hueRotate || 0) * distance;
            const invert = Math.max(0, Math.min(100, (fcfg.invert || 0) * distance));
            const saturate = 100 + (fcfg.saturate || 0) * distance;
            const sepia = Math.max(0, Math.min(100, (fcfg.sepia || 0) * distance));
            filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) invert(${invert}%) saturate(${saturate}%) sepia(${sepia}%)`;
        }

        const wasTransition = slide.style.transition;
        slide.style.transition = 'none';
        slide.style.transform = transform;
        if (filter) {
            slide.style.filter = filter;
        }

        if (distance === 0) {
            slide.style.zIndex = '10';
        } else {
            slide.style.zIndex = Math.max(1, 10 - distance);
        }
        if (slide.classList) {
            slide.classList.toggle('zhenshangyin-slide-active', distance < 0.5);
        }

        slide.offsetHeight;

        slide.style.transition = wasTransition;
    }

    applyTransforms(slide, index) {
        const { transforms } = this.options;
        const { position, distance } = this.getTransformPositionAndDistance(index);

        const mode = this.getScaleCenterMode();
        let transform = '';
        let filter = '';

        let translateX = 0, translateY = 0, translateZ = 0;
        if (transforms.uniformSpacing && transforms.uniformSpacing.enabled) {
            if (mode === 'pair') {
                const uniformSpacing = transforms.uniformSpacing || {};
                const baseWidth = this.getSlideSize ? this.getSlideSize() : 0;
                const containerWidth = this.containerWidth || (this.container ? this.container.getBoundingClientRect().width : window.innerWidth);
                const referenceWidth = baseWidth || containerWidth;
                const customSpacing = uniformSpacing.customSpacing;
                const gapBase = typeof uniformSpacing.gap === 'number' ? uniformSpacing.gap : 0;
                const centerGapPx = (customSpacing && Array.isArray(customSpacing) && customSpacing.length > 0)
                    ? this.parseUnitToPx(customSpacing[0], referenceWidth)
                    : gapBase;
                const rawDistance = Math.abs(position);
                if (centerGapPx) {
                    const clampedPos = Math.max(-0.5, Math.min(0.5, position || 0));
                    const t = clampedPos / 0.5;
                    translateX += (centerGapPx / 2) * t;
                }
                const d = Math.max(0, rawDistance - 0.5);
                if (d > 0) {
                    translateX += this.computeUniformSpacingOffset(d, position, 1);
                }
            } else {
                translateX += this.computeUniformSpacingOffset(Math.abs(position), position);
            }
        }

        if (transforms.translate.enabled) {
            translateX += this.stepValue(transforms.translate.x, distance);
            translateY += this.stepValue(transforms.translate.y, distance);
            translateZ += this.stepValue(transforms.translate.z, distance);
        }

        if (transforms.scale && transforms.scale.enabled) {
            const depthBoost = Math.max(0, 0 - (distance * 5));
            translateZ += depthBoost;
        }
        if (translateX !== 0 || translateY !== 0 || translateZ !== 0) {
            transform += ` translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`;
        }

        if (transforms.scale.enabled) {
            const scale = this.scaleAt(distance);
            transform += ` scale(${scale})`;
        }

        if (transforms.rotate.enabled) {
            const x = this.stepValue(transforms.rotate.x, distance);
            const y = this.stepValue(transforms.rotate.y, distance) * -Math.sign(position);
            const z = this.stepValue(transforms.rotate.z, distance) * Math.sign(position);
            transform += ` rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
        }

        if (transforms.skew.enabled) {
            const x = this.stepValue(transforms.skew.x, distance) * Math.sign(position);
            const y = this.stepValue(transforms.skew.y, distance) * Math.sign(position);
            transform += ` skew(${x}deg, ${y}deg)`;
        }

        if (transforms.opacity.enabled) {
            const ocfg = transforms.opacity || {};
            const step = typeof ocfg.step === 'number' ? ocfg.step : 0;
            const opacity = Math.max(0, Math.min(1, 1 - step * distance));
            slide.style.opacity = opacity;
        }

        if (transforms.filter.enabled) {
            const fcfg = transforms.filter || {};
            const blur = (fcfg.blur || 0) * distance;
            const brightness = 100 + (fcfg.brightness || 0) * distance;
            const contrast = 100 + (fcfg.contrast || 0) * distance;
            const grayscale = Math.max(0, Math.min(100, (fcfg.grayscale || 0) * distance));
            const hueRotate = (fcfg.hueRotate || 0) * distance;
            const invert = Math.max(0, Math.min(100, (fcfg.invert || 0) * distance));
            const saturate = 100 + (fcfg.saturate || 0) * distance;
            const sepia = Math.max(0, Math.min(100, (fcfg.sepia || 0) * distance));
            filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) invert(${invert}%) saturate(${saturate}%) sepia(${sepia}%)`;
        }

        slide.style.transform = transform;
        if (filter) {
            slide.style.filter = filter;
        }

        if (distance === 0) {
            slide.style.zIndex = '10';
        } else {
            slide.style.zIndex = Math.max(1, 10 - distance);
        }
    }

    updateTransforms() {
        if (!this.slides) return;
        this.slides.forEach((slide, index) => {
            this.applyTransforms(slide, index);
        });
    }

    fixCenteredAutoSlides() {
        if (!this.container || !this.wrapper) return;
        const containerWidth = this.container.offsetWidth;
        const slideWidth = this.getSlideSize();
        const spaceBetween = this.options.spaceBetween || 0;

        let visibleSlides;
        if (typeof this.options.slidesPerView === 'number') {
            visibleSlides = this.options.slidesPerView;
        } else {
            visibleSlides = Math.floor((containerWidth + spaceBetween) / (slideWidth + spaceBetween));
        }

        if (visibleSlides > 1) {
            const totalWidth = (slideWidth * visibleSlides) + (spaceBetween * (visibleSlides - 1));
            const centerOffset = (containerWidth - totalWidth) / 2;

            if (centerOffset > 0) {
                this.wrapper.style.paddingLeft = `${centerOffset}px`;
                this.wrapper.style.paddingRight = `${centerOffset}px`;
            } else {
                this.wrapper.style.paddingLeft = '0px';
                this.wrapper.style.paddingRight = '0px';
            }
        }
    }

    forceCenter() {
        if (!this.container) return;
        if (this.options.centeredSlides) {
            this.container.classList.add('zhenshangyin-centered');

            const originalUpdateSlides = this.updateSlides;
            this.updateSlides = () => {
                originalUpdateSlides.call(this);

                const mode = this.getScaleCenterMode();
                const leftIndex = this.currentIndex;
                const rightIndex = this.currentIndex + 1;
                const activeIndex = mode === 'pair' ? leftIndex : this.currentIndex;
                const activeSlide = this.slides[activeIndex];
                if (!activeSlide) return;

                const containerWidth = this.container.offsetWidth;
                const slideWidth = this.getSlideSize();
                const spaceBetween = this.options.spaceBetween || 0;

                let offsetLeft = 0;
                for (let i = 0; i < activeIndex; i++) {
                    const currentSlide = this.slides[i];
                    if (!currentSlide) continue;

                    const currentSlideWidth = this.options.slidesPerView === 'auto'
                        ? parseFloat(window.getComputedStyle(currentSlide).width)
                        : slideWidth;

                    offsetLeft += currentSlideWidth + spaceBetween;
                }

                const activeSlideWidth = this.options.slidesPerView === 'auto'
                    ? parseFloat(window.getComputedStyle(activeSlide).width)
                    : slideWidth;

                let targetX;
                if (mode === 'pair') {
                    const rightSlide = this.slides[rightIndex];
                    if (!rightSlide) return;
                    const rightSlideWidth = this.options.slidesPerView === 'auto'
                        ? parseFloat(window.getComputedStyle(rightSlide).width)
                        : slideWidth;
                    const pairWidth = activeSlideWidth + spaceBetween + rightSlideWidth;
                    const pairCenterOffsetFromLeft = pairWidth / 2;
                    targetX = (containerWidth / 2) - offsetLeft - pairCenterOffsetFromLeft;
                } else {
                    targetX = (containerWidth / 2) - offsetLeft - (activeSlideWidth / 2);
                }

                const isLoopJump = this.wrapper.style.transition === 'none';

                if (!this.initialized || isLoopJump) {
                    this.wrapper.style.transform = `translateX(${targetX}px)`;
                } else {
                    requestAnimationFrame(() => {
                        this.wrapper.style.transform = `translateX(${targetX}px)`;
                    });
                }
            };

            this.updateSlides();
        }
    }

    initializeAnimations() {
        this.slides.forEach(slide => {
            slide.style.transition = 'none';
        });
        this.wrapper.style.transition = 'none';

        this.wrapper.offsetHeight;

        this.updateTransforms();
        this.forceCenter();

        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.style.transition = `all ${this.options.speed}ms ease`;
            });
            this.wrapper.style.transition = `transform ${this.options.speed}ms ease`;
            this.initialized = true;
        }, 50);

        this.resizeHandler = () => {
            this.updateTransforms();
            this.forceCenter();
        };
        window.addEventListener('resize', this.resizeHandler);
    }



    checkBreakpointWithLoop() {
        const breakpoints = this.options.breakpoints;
        const windowWidth = window.innerWidth;
        const prevLoop = this.options.loop;

        const sortedBreakpoints = Object.keys(breakpoints)
            .map(key => parseInt(key))
            .sort((a, b) => b - a);

        let newBreakpoint = null;
        for (const width of sortedBreakpoints) {
            if (windowWidth <= width) {
                newBreakpoint = width;
            }
        }

        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;

            this.options = { ...this.originalOptions };

            if (newBreakpoint && breakpoints[newBreakpoint]) {
                this.options = {
                    ...this.options,
                    ...breakpoints[newBreakpoint]
                };
            }

            const newLoop = this.options.loop;
            if (prevLoop !== newLoop) {
                this.rebuildSlidesForLoopChange(prevLoop, newLoop);
            }

            if (newBreakpoint && breakpoints[newBreakpoint] && breakpoints[newBreakpoint].transforms) {
                this.options.transforms = {
                    ...this.originalTransforms,
                    ...breakpoints[newBreakpoint].transforms
                };
            } else {
                this.options.transforms = { ...this.originalTransforms };
            }

            if (this.isTransformsEnabled && this.isTransformsEnabled()) {
                this.initTransformEffects();
            }
        }
    }

    checkBreakpoint() {
        const breakpoints = this.options.breakpoints;
        const windowWidth = window.innerWidth;
        const sortedBreakpoints = Object.keys(breakpoints)
            .map(key => parseInt(key))
            .map(key => parseInt(key))
            .sort((a, b) => b - a);
        let newBreakpoint = null;
        for (const width of sortedBreakpoints) {
            if (windowWidth <= width) {
                newBreakpoint = width;
            }
        }
        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;

            this.options = { ...this.originalOptions };

            if (newBreakpoint && breakpoints[newBreakpoint]) {
                this.options = {
                    ...this.options,
                    ...breakpoints[newBreakpoint]
                };

                if (breakpoints[newBreakpoint].transforms) {
                    this.options.transforms = {
                        ...this.originalTransforms,
                        ...breakpoints[newBreakpoint].transforms
                    };
                } else {
                    this.options.transforms = { ...this.originalTransforms };
                }
            } else {
                this.options.transforms = { ...this.originalTransforms };
            }

            this.updateLayout();
            this.updateTransforms();
        }
    }

    restoreAllowClickAfterTouch() {
        const checkTouchComplete = () => {
            if (!this.isTouched && !this.isMoved && !this.isAnimating) {
                this.allowClick = true;
                return;
            }

            requestAnimationFrame(checkTouchComplete);
        };

        requestAnimationFrame(checkTouchComplete);
    }

    hidePaginationElements() {
        const paginationConfig = this.options.pagination;
        if (!paginationConfig || typeof paginationConfig !== 'object') return;

        if (paginationConfig.el) {
            const pagerEls = typeof paginationConfig.el === 'string'
                ? document.querySelectorAll(paginationConfig.el)
                : [paginationConfig.el];

            pagerEls.forEach(pagerEl => {
                if (pagerEl) {
                    pagerEl.classList.add('zhenshangyin-pagination-hidden');
                    pagerEl.style.display = 'none';
                }
            });
            return;
        }

        const paginationTypes = ['bullets', 'numbers', 'fraction', 'progressbar', 'scrollbar'];
        paginationTypes.forEach(type => {
            const config = paginationConfig[type];
            if (!config || !config.el) return;

            const pagerEls = typeof config.el === 'string'
                ? document.querySelectorAll(config.el)
                : [config.el];

            pagerEls.forEach(pagerEl => {
                if (pagerEl) {
                    pagerEl.classList.add('zhenshangyin-pagination-hidden');
                    pagerEl.style.display = 'none';
                }
            });
        });
    }

    hideNavigationButtons() {
        const { prevEl, nextEl } = this.options.navigation;

        if (prevEl) {
            const prevButtons = typeof prevEl === 'string'
                ? document.querySelectorAll(prevEl)
                : [prevEl];

            prevButtons.forEach(button => {
                if (button) {
                    button.classList.add('zhenshangyin-navigation-hidden');
                    button.style.display = 'none';
                }
            });
        }

        if (nextEl) {
            const nextButtons = typeof nextEl === 'string'
                ? document.querySelectorAll(nextEl)
                : [nextEl];

            nextButtons.forEach(button => {
                if (button) {
                    button.classList.add('zhenshangyin-navigation-hidden');
                    button.style.display = 'none';
                }
            });
        }
    }
}

class ZhenshangyinDatePicker {
    constructor(inputSelector, options = {}) {
        if (Array.isArray(inputSelector)) {
            this.startInput = document.querySelector(inputSelector[0]);
            this.endInput = document.querySelector(inputSelector[1]);
            if (!this.startInput || !this.endInput) {
                return;
            }
            this.isSeparate = true;
        } else {
            this.dateInput = document.querySelector(inputSelector);
            if (!this.dateInput) {
                return;
            }
            this.isSeparate = false;
        }

        this.type = options.type || 'date';
        this.dateFormat = this.getDefaultFormat(options.dateFormat);
        this.language = options.language || 'zh';
        this.separator = options.separator || (this.isRangeType() ? ' - ' : ', ');
        this.onSelect = options.onSelect || function () { };
        this.multiSelect = options.multiSelect || false;
        this.dateDelimiter = options.dateDelimiter || ',';
        this.shortcuts = options.shortcuts || false;

        if (options.separator === undefined) {
            this.separator = this.isRangeType() ? ' - ' : this.separator;
        }   

        this.showTime = this.dateFormat.includes('HH') || this.dateFormat.includes('mm') || this.dateFormat.includes('ss');
        this.showHours = this.dateFormat.includes('HH');
        this.showMinutes = this.dateFormat.includes('mm');
        this.showSeconds = this.dateFormat.includes('ss');
        this.availableHours = options.availableHours || Array.from({ length: 24 }, (_, i) => i);
        this.availableMinutes = options.availableMinutes || Array.from({ length: 60 }, (_, i) => i);
        this.availableSeconds = options.availableSeconds || Array.from({ length: 60 }, (_, i) => i);

        this.disabledItems = new Set(options.disabledItems || []);
        this.disabledRanges = (options.disabledRanges || []).map(range => ({
            start: range.start,
            end: range.end
        }));
        this.disabledWeekdays = options.disabledWeekdays || [];

        this.initializeState();
        this.parseInputValues();
        this.styleElement = null;
        this.uniqueClassName = `zhenshangyin-unified-${this.type}-${Math.random().toString(36).substring(2, 15)}`;
        this._onWindowScroll = null;
        this._onWindowResize = null;
        this._onDocClickDropdown = null;
        this._onDocClickDropdownStart = null;
        this._onDocClickDropdownEnd = null;
        this._onPickerClick = null;
        this._onPickerMouseOver = null;
        this._onPickerMouseOut = null;
        this._onDocumentClickClose = null;
        this._onDocumentFocusinClose = null;
        this._onInputClickHandler = null;
        this._isOpen = false;
        this._pickerRemoveTimer = null;
        this.dom = null;
        this.init();
    }

    shouldShowShortcuts() {
        if (!this.shortcuts) return false;
        if (this.shortcuts === true) return true;
        return Array.isArray(this.shortcuts) && this.shortcuts.length > 0;
    }

    wrapWithShortcuts(contentHTML) {
        const shortcutsHTML = this.createShortcutsHTML();
        if (shortcutsHTML) {
            return `
                <div class="zhenshangyin-shortcuts-aside">${shortcutsHTML}</div>
                <div class="zhenshangyin-shortcuts-main">${contentHTML}</div>
            `;
        }
        return `<div class="zhenshangyin-shortcuts-main">${contentHTML}</div>`;
    }

    getShortcuts() {
        if (!this.shouldShowShortcuts()) return [];

        if (this.shortcuts === true) {
            if (this.type === 'date') {
                return [
                    { text: this.language === 'en' ? 'Yesterday' : '昨天', action: 'yesterday' },
                    { text: this.language === 'en' ? 'Today' : '今天', action: 'today' },
                    { text: this.language === 'en' ? 'Tomorrow' : '明天', action: 'tomorrow' },
                    { text: this.language === 'en' ? 'A Week Ago' : '一周前', action: 'weekAgo' },
                    { text: this.language === 'en' ? 'A Month Ago' : '一个月前', action: 'monthAgo' }
                ];
            }
            if (this.type === 'week') {
                return [
                    { text: this.language === 'en' ? 'This Week' : '本周', action: 'thisWeek' },
                    { text: this.language === 'en' ? 'Last Week' : '上周', action: 'lastWeek' },
                    { text: this.language === 'en' ? 'Next Week' : '下周', action: 'nextWeek' }
                ];
            }
            if (this.type === 'month') {
                return [
                    { text: this.language === 'en' ? 'This Month' : '本月', action: 'thisMonth' },
                    { text: this.language === 'en' ? 'Last Month' : '上月', action: 'lastMonth' },
                    { text: this.language === 'en' ? 'Next Month' : '下月', action: 'nextMonth' }
                ];
            }
            if (this.type === 'year') {
                return [
                    { text: this.language === 'en' ? 'This Year' : '今年', action: 'thisYear' },
                    { text: this.language === 'en' ? 'Last Year' : '去年', action: 'lastYear' },
                    { text: this.language === 'en' ? 'Next Year' : '明年', action: 'nextYear' }
                ];
            }

            if (this.type === 'dateRange') {
                return [
                    { text: this.language === 'en' ? 'Last Week' : '近一周', action: 'lastWeek' },
                    { text: this.language === 'en' ? 'Last Month' : '近一个月', action: 'lastMonth' },
                    { text: this.language === 'en' ? 'Last 3 Months' : '近三个月', action: 'last3Months' }
                ];
            }
            if (this.type === 'monthRange') {
                return [
                    { text: this.language === 'en' ? 'Last Month' : '近一个月', action: 'lastMonth' },
                    { text: this.language === 'en' ? 'Last 3 Months' : '近三个月', action: 'last3Months' },
                    { text: this.language === 'en' ? 'Last 6 Months' : '近六个月', action: 'last6Months' },
                    { text: this.language === 'en' ? 'Last Year' : '近一年', action: 'lastYear' }
                ];
            }
            if (this.type === 'yearRange') {
                return [
                    { text: this.language === 'en' ? 'Last Year' : '近一年', action: 'lastYear' },
                    { text: this.language === 'en' ? 'Last 3 Years' : '近三年', action: 'last3Years' },
                    { text: this.language === 'en' ? 'Last 5 Years' : '近五年', action: 'last5Years' },
                    { text: this.language === 'en' ? 'Last 10 Years' : '近十年', action: 'last10Years' }
                ];
            }
        }

        return Array.isArray(this.shortcuts) ? this.shortcuts : [];
    }

    createShortcutsHTML() {
        const shortcuts = this.getShortcuts();
        if (!shortcuts.length) return '';
        return `
            ${shortcuts.map((s, idx) => {
                return `<button class="zhenshangyin-shortcut-btn" data-shortcut-index="${idx}">${s.text || ''}</button>`;
            }).join('')}
        `;
    }

    runShortcut(shortcut) {
        if (!shortcut) return;
        if (typeof shortcut.onSelect === 'function') {
            shortcut.onSelect(this);
            return;
        }

        const action = shortcut.action;
        if (!action) return;

        const today = new Date();
        const addDays = (d) => {
            const dt = new Date(today);
            dt.setDate(dt.getDate() + d);
            return dt;
        };
        const getWeekDates = (baseDate) => {
            const start = new Date(baseDate);
            start.setDate(baseDate.getDate() - baseDate.getDay());
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                return d;
            });
        };

        const applyDateRange = (start, end) => {
            this.startDate = this.normalizeDate(start);
            this.endDate = this.normalizeDate(end);
            if (this.startDate > this.endDate) {
                [this.startDate, this.endDate] = [this.endDate, this.startDate];
            }
            this.startYear = this.startDate.getFullYear();
            this.startMonth = this.startDate.getMonth();
            this.endYear = this.endDate.getFullYear();
            this.endMonth = this.endDate.getMonth();
            this.updateInputValue();
            if (this.picker) {
                this.updateCalendar('start');
                this.updateCalendar('end');
                if (this.showTime) this.updateRangeTimeLabels();
                this.applyRangeStyles();
            }
            if (!this.showTime) this.closePicker();
            if (this.showTime) this.updateRangeTimeLabels();
        };

        const applyMonthRange = (startYear, startMonthIndex, endYear, endMonthIndex) => {
            this.startMonth = new Date(startYear, startMonthIndex, 1);
            this.endMonth = new Date(endYear, endMonthIndex, 1);
            if (this.startMonth > this.endMonth) {
                [this.startMonth, this.endMonth] = [this.endMonth, this.startMonth];
            }
            this.currentYear = this.startMonth.getFullYear();
            this.endYear = this.endMonth.getFullYear();
            this.updateInputValue();
            this.closePicker();
        };

        const applyYearRange = (startYear, endYear) => {
            this.startYear = startYear;
            this.endYear = endYear;
            if (this.startYear > this.endYear) {
                [this.startYear, this.endYear] = [this.endYear, this.startYear];
            }
            this.updateInputValue();
            this.closePicker();
        };

        if (this.type === 'date') {
            let d = null;
            if (action === 'today') {
                d = addDays(0);
            } else if (action === 'yesterday') {
                d = addDays(-1);
            } else if (action === 'tomorrow') {
                d = addDays(1);
            } else if (action === 'weekAgo') {
                d = addDays(-7);
            } else if (action === 'monthAgo') {
                d = addDays(-30);
            } else if (action === 'thisWeekStart') {
                const weekDates = getWeekDates(addDays(0));
                d = weekDates[0];
            } else if (action === 'lastWeekStart') {
                const weekDates = getWeekDates(addDays(-7));
                d = weekDates[0];
            } else if (action === 'thisMonthStart') {
                d = new Date(today.getFullYear(), today.getMonth(), 1);
            } else if (action === 'lastMonthStart') {
                d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            }
            if (d) this.selectDate(this.normalizeDate(d));
            return;
        }

        if (this.type === 'week') {
            const base = action === 'thisWeek' ? addDays(0) : action === 'lastWeek' ? addDays(-7) : action === 'nextWeek' ? addDays(7) : null;
            if (!base) return;
            this.currentYear = base.getFullYear();
            this.currentMonth = base.getMonth();
            const weekDates = getWeekDates(base);
            this.selectWeek(weekDates);
            return;
        }

        if (this.type === 'month') {
            const base = action === 'thisMonth' ? addDays(0) : action === 'lastMonth' ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : action === 'nextMonth' ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : null;
            if (!base) return;
            this.currentYear = base.getFullYear();
            this.currentMonth = base.getMonth();
            this.selectMonth(this.currentYear, this.currentMonth + 1);
            return;
        }

        if (this.type === 'year') {
            const y = action === 'thisYear' ? today.getFullYear() : action === 'lastYear' ? today.getFullYear() - 1 : action === 'nextYear' ? today.getFullYear() + 1 : null;
            if (typeof y === 'number') {
                this.currentYear = y;
                this.selectYear(y);
            }
            return;
        }

        if (this.type === 'dateRange') {
            if (action === 'lastWeek') {
                applyDateRange(addDays(-6), today);
            } else if (action === 'lastMonth') {
                applyDateRange(addDays(-29), today);
            } else if (action === 'last3Months') {
                applyDateRange(addDays(-89), today);
            }
            return;
        }

        if (this.type === 'monthRange') {
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            
            if (action === 'lastMonth') {
                const startDate = new Date(currentYear, currentMonth - 1, 1);
                applyMonthRange(startDate.getFullYear(), startDate.getMonth(), currentYear, currentMonth);
            } else if (action === 'last3Months') {
                const startDate = new Date(currentYear, currentMonth - 2, 1);
                applyMonthRange(startDate.getFullYear(), startDate.getMonth(), currentYear, currentMonth);
            } else if (action === 'last6Months') {
                const startDate = new Date(currentYear, currentMonth - 5, 1);
                applyMonthRange(startDate.getFullYear(), startDate.getMonth(), currentYear, currentMonth);
            } else if (action === 'lastYear') {
                const startDate = new Date(currentYear, currentMonth - 11, 1);
                applyMonthRange(startDate.getFullYear(), startDate.getMonth(), currentYear, currentMonth);
            }
            return;
        }

        if (this.type === 'yearRange') {
            const currentYear = today.getFullYear();
            if (action === 'lastYear') {
                applyYearRange(currentYear - 1, currentYear);
            } else if (action === 'last3Years') {
                applyYearRange(currentYear - 2, currentYear);
            } else if (action === 'last5Years') {
                applyYearRange(currentYear - 4, currentYear);
            } else if (action === 'last10Years') {
                applyYearRange(currentYear - 9, currentYear);
            }
        }
    }

    setupShortcutsEvents() {
        return;
    }

    getDefaultFormat(customFormat) {
        if (customFormat) return customFormat;
        const formats = {
            date: 'YYYY-MM-DD', dateRange: 'YYYY-MM-DD', week: 'YYYY-MM-DD',
            month: 'YYYY-MM', monthRange: 'YYYY-MM', year: 'YYYY', yearRange: 'YYYY', time: 'HH:mm:ss', timeRange: 'HH:mm:ss'
        };
        return formats[this.type] || 'YYYY-MM-DD';
    }

    isRangeType() {
        return ['dateRange', 'monthRange', 'yearRange', 'timeRange'].includes(this.type);
    }

    initializeState() {
        const currentDate = new Date();
        this.currentYear = currentDate.getFullYear();
        this.currentMonth = currentDate.getMonth();
        this.selectedDate = null;
        this.selectedDates = new Set();
        this._datePanelState = null;
        this._dateRangePanelState = null;

        if (this.isRangeType()) {
            this.startDate = null; this.endDate = null; this.startMonth = null; this.endMonth = null;
            this.startYear = null; this.endYear = null; this.isSelectingStart = true;

            if (this.type === 'dateRange') {
                this.startYear = this.currentYear; this.startMonth = this.currentMonth;
                this.endYear = this.currentYear; this.endMonth = this.currentMonth + 1;
                if (this.endMonth > 11) { this.endMonth = 0; this.endYear++; }
            } else if (this.type === 'monthRange') {
                this.endYear = this.currentYear + 1;
            } else if (this.type === 'yearRange') {
                this.startPanelYear = this.currentYear;
                const firstPanelStartYear = Math.floor(this.currentYear / 10) * 10;
                this.endPanelYear = firstPanelStartYear + 12;
            }
        }

        this.selectedWeek = null; this.lastSelectedMonth = null; this.lastSelectedYear = null;
        this.selectedYears = []; this.selectedMonths = [];
        this.selectedTime = { hours: this.availableHours[0] || 0, minutes: this.availableMinutes[0] || 0, seconds: this.availableSeconds[0] || 0 };

        if (this.isRangeType() || this.type === 'time' || this.type === 'timeRange') {
            this.startTime = { hours: 0, minutes: 0, seconds: 0 };
            this.endTime = { hours: 0, minutes: 0, seconds: 0 };
        }
    }

    parseInputValues() {
        const splitRangeValue = (value) => {
            if (!value) return null;
            const parts = value.split(this.separator);
            if (parts.length < 2) return null;
            return [parts[0].trim(), parts[1].trim()];
        };

        const ensureDateRangePanels = () => {
            if (this.startDate && this.endDate &&
                this.startYear === this.endYear && this.startMonth === this.endMonth) {
                this.endMonth = this.startMonth + 1;
                if (this.endMonth > 11) {
                    this.endMonth = 0;
                    this.endYear = this.startYear + 1;
                }
            } else if (this.startDate && !this.endDate) {
                this.endYear = this.startYear;
                this.endMonth = this.startMonth + 1;
                if (this.endMonth > 11) {
                    this.endMonth = 0;
                    this.endYear = this.startYear + 1;
                }
            }
        };

        if (this.isSeparate && this.isRangeType()) {
            const startValue = (this.startInput?.value || '').trim();
            const endValue = (this.endInput?.value || '').trim();

            if (this.type === 'dateRange') {
                if (startValue) {
                    this.startDate = this.parseDateFromString(startValue);
                    if (this.startDate) {
                        this.startYear = this.startDate.getFullYear();
                        this.startMonth = this.startDate.getMonth();
                    }
                }

                if (endValue) {
                    this.endDate = this.parseDateFromString(endValue);
                    if (this.endDate) {
                        this.endYear = this.endDate.getFullYear();
                        this.endMonth = this.endDate.getMonth();
                    }
                }

                ensureDateRangePanels();
            } else if (this.type === 'monthRange') {
                if (startValue) {
                    this.startMonth = this.parseMonthFromString(startValue);
                    if (this.startMonth) {
                        this.startYear = this.startMonth.getFullYear();
                    }
                }

                if (endValue) {
                    this.endMonth = this.parseMonthFromString(endValue);
                    if (this.endMonth) {
                        this.endYear = this.endMonth.getFullYear();
                    }
                }
            } else if (this.type === 'yearRange') {
                if (startValue) {
                    this.startYear = parseInt(startValue, 10);
                }

                if (endValue) {
                    this.endYear = parseInt(endValue, 10);
                }

                this.syncYearRangePanelYears();
            }

            this.isSelectingStart = !this.startDate && !this.startMonth && !this.startYear;
        } else if (this.dateInput) {
            const value = (this.dateInput.value || '').trim();
            if (!value) return;

            if (this.isRangeType()) {
                if (this.type === 'monthRange') {
                    const rangeParts = splitRangeValue(value);
                    if (rangeParts) {
                        const [startStr, endStr] = rangeParts;

                        if (startStr) {
                            this.startMonth = this.parseMonthFromString(startStr);
                            if (this.startMonth) {
                                this.startYear = this.startMonth.getFullYear();
                                this.currentYear = this.startYear;
                            }
                        }

                        if (endStr) {
                            this.endMonth = this.parseMonthFromString(endStr);
                            if (this.endMonth) {
                                this.endYear = this.endMonth.getFullYear();
                            }
                        }

                        if (this.startMonth && this.endMonth) {
                            this.isSelectingStart = true;
                        } else if (this.startMonth) {
                            this.isSelectingStart = false;
                        }
                    }
                } else if (this.type === 'yearRange') {
                    const rangeParts = splitRangeValue(value);
                    if (rangeParts) {
                        const [startStr, endStr] = rangeParts;

                        if (startStr) {
                            const y = parseInt(startStr, 10);
                            if (!isNaN(y)) this.startYear = y;
                        }

                        if (endStr) {
                            const y = parseInt(endStr, 10);
                            if (!isNaN(y)) this.endYear = y;
                        }

                        if (this.startYear && this.endYear) {
                            this.isSelectingStart = true;
                        } else if (this.startYear) {
                            this.isSelectingStart = false;
                        }

                        this.syncYearRangePanelYears();
                    }
                } else {
                    const rangeParts = splitRangeValue(value);
                    if (rangeParts) {
                        const [startStr, endStr] = rangeParts;

                        if (startStr) {
                            this.startDate = this.parseDateFromString(startStr);
                            if (this.startDate) {
                                this.startYear = this.startDate.getFullYear();
                                this.startMonth = this.startDate.getMonth();
                            }
                        }

                        if (endStr) {
                            this.endDate = this.parseDateFromString(endStr);
                            if (this.endDate) {
                                this.endYear = this.endDate.getFullYear();
                                this.endMonth = this.endDate.getMonth();
                            }
                        }

                        ensureDateRangePanels();

                        if (this.startDate && this.endDate) {
                            this.isSelectingStart = true;
                        } else if (this.startDate) {
                            this.isSelectingStart = false;
                        }
                    }
                }
            } else if (this.type === 'date') {
                this.selectedDate = this.parseDateFromString(value);
                if (this.selectedDate) {
                    this.currentYear = this.selectedDate.getFullYear();
                    this.currentMonth = this.selectedDate.getMonth();
                }
            } else if (this.type === 'week') {
                const parts = value.split(this.separator);
                if (parts.length >= 2) {
                    const startDate = this.parseDateFromString(parts[0].trim());
                    const endDate = this.parseDateFromString(parts[1].trim());
                    if (startDate && endDate) {
                        this.selectedWeek = { start: startDate, end: endDate };
                        this.currentYear = startDate.getFullYear();
                        this.currentMonth = startDate.getMonth();
                    }
                }
            } else if (this.type === 'month') {
                if (this.multiSelect) {
                    const months = value.split(this.separator);
                    this.selectedMonths = months.map(monthStr => {
                        const date = this.parseDateFromString(monthStr.trim());
                        return date ? { year: date.getFullYear(), month: date.getMonth() + 1 } : null;
                    }).filter(Boolean);
                } else {
                    const date = this.parseDateFromString(value);
                    if (date) {
                        this.selectedMonths = [{ year: date.getFullYear(), month: date.getMonth() + 1 }];
                        this.currentYear = date.getFullYear();
                    }
                }
            } else if (this.type === 'year') {
                if (this.multiSelect) {
                    this.selectedYears = value.split(this.separator).map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
                } else {
                    const year = parseInt(value, 10);
                    if (!isNaN(year)) {
                        this.selectedYears = [year];
                        this.currentYear = year;
                    }
                }
            } else if (this.type === 'time' || this.type === 'timeRange') {
                this.parseTimeInputValue();
            }
        }
    }

    parseDateFromString(dateStr) {
        if (!dateStr) return null;

        const parseDateParts = ({ year, month, day, hours, minutes, seconds }) => {
            const y = parseInt(year, 10);
            const m = parseInt(month, 10) - 1;
            const d = parseInt(day, 10);
            const hh = hours ? parseInt(hours, 10) : 0;
            const mm = minutes ? parseInt(minutes, 10) : 0;
            const ss = seconds ? parseInt(seconds, 10) : 0;
            const date = new Date(y, m, d, hh, mm, ss);
            return !isNaN(date.getTime()) ? date : null;
        };

        const matchYMD = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
        if (matchYMD) {
            return parseDateParts({
                year: matchYMD[1],
                month: matchYMD[2],
                day: matchYMD[3],
                hours: matchYMD[4],
                minutes: matchYMD[5],
                seconds: matchYMD[6]
            });
        }

        const matchMDY = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
        if (matchMDY) {
            return parseDateParts({
                year: matchMDY[3],
                month: matchMDY[1],
                day: matchMDY[2],
                hours: matchMDY[4],
                minutes: matchMDY[5],
                seconds: matchMDY[6]
            });
        }

        const matchYMDSlash = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?$/);
        if (matchYMDSlash) {
            return parseDateParts({
                year: matchYMDSlash[1],
                month: matchYMDSlash[2],
                day: matchYMDSlash[3],
                hours: matchYMDSlash[4],
                minutes: matchYMDSlash[5],
                seconds: matchYMDSlash[6]
            });
        }

        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date : null;
    }

    parseMonthFromString(monthStr) {
        if (!monthStr) return null;

        const monthMatch = monthStr.match(/^(\d{4})-(\d{1,2})$/);
        if (monthMatch) {
            const year = parseInt(monthMatch[1], 10);
            const month = parseInt(monthMatch[2], 10) - 1;
            const date = new Date(year, month, 1);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        return null;
    }

    init() {
        const clickHandler = (event) => {
            event.stopPropagation();
            if (this.isSeparate) {
                this.isSelectingStart = (event.currentTarget === this.startInput);
            }
            this.createPicker();
            this.togglePicker();
            this.applyInitialStyles();
        };

        this._onInputClickHandler = clickHandler;

        if (this.isSeparate) {
            this.startInput.addEventListener('click', this._onInputClickHandler);
            this.endInput.addEventListener('click', this._onInputClickHandler);
        } else {
            this.dateInput.addEventListener('click', this._onInputClickHandler);
        }

        this._onDocumentClickClose = () => { this.closePicker(); };
        this._onDocumentFocusinClose = (event) => {
            const target = event.target;
            const isSelfInput = this.isSeparate
                ? (target === this.startInput || target === this.endInput)
                : (target === this.dateInput);
            const isInsidePicker = this.picker && this.picker.contains(target);
            if (!isSelfInput && !isInsidePicker) {
                this.closePicker();
            }
        };
        document.addEventListener('click', this._onDocumentClickClose);
        document.addEventListener('focusin', this._onDocumentFocusinClose);
    }

    createPicker() {
        if (this.picker) return;
        this.parseInputValues();
        const picker = document.createElement('div');
        picker.className = this.getPickerClassName();
        picker.innerHTML = this.getPickerHTML();
        document.body.appendChild(picker);
        this.picker = picker;
        picker.addEventListener('click', (event) => { event.stopPropagation(); });
        this.setupPickerEvents();
        this.cachePickerDom();
        this.bindPickerDelegatedEvents();
    }

    cachePickerDom() {
        if (!this.picker) {
            this.dom = null;
            this.domById = null;
            return;
        }
        this.dom = {
            calendarBody: this.picker.querySelector('#calendar-body'),
            startCalendarBody: this.picker.querySelector('#start-calendar-body'),
            endCalendarBody: this.picker.querySelector('#end-calendar-body'),
            weekCalendarBody: this.picker.querySelector('#week-calendar-body'),
            startWeekCalendarBody: this.picker.querySelector('#start-week-calendar-body'),
            endWeekCalendarBody: this.picker.querySelector('#end-week-calendar-body'),
            monthBody: this.picker.querySelector('#month-picker-body'),
            startMonthBody: this.picker.querySelector('#start-month-picker-body'),
            endMonthBody: this.picker.querySelector('#end-month-picker-body'),
            yearBody: this.picker.querySelector('#year-picker-body'),
            startYearBody: this.picker.querySelector('#start-year-picker-body'),
            endYearBody: this.picker.querySelector('#end-year-picker-body'),
            confirmBtn: this.picker.querySelector('.zhenshangyin-confirm-btn'),

            display: this.picker.querySelector('.zhenshangyin-current-display'),
            startDisplay: this.picker.querySelector('.zhenshangyin-current-display[data-type="start"]'),
            endDisplay: this.picker.querySelector('.zhenshangyin-current-display[data-type="end"]'),

            yearEl: this.picker.querySelector('.zhenshangyin-current-year'),
            monthEl: this.picker.querySelector('.zhenshangyin-current-month'),
            startYearEl: this.picker.querySelector('.zhenshangyin-current-year[data-type="start"]'),
            startMonthEl: this.picker.querySelector('.zhenshangyin-current-month[data-type="start"]'),
            endYearEl: this.picker.querySelector('.zhenshangyin-current-year[data-type="end"]'),
            endMonthEl: this.picker.querySelector('.zhenshangyin-current-month[data-type="end"]')
        };

        this.domById = {
            'calendar-body': this.dom.calendarBody,
            'start-calendar-body': this.dom.startCalendarBody,
            'end-calendar-body': this.dom.endCalendarBody,
            'week-calendar-body': this.dom.weekCalendarBody,
            'start-week-calendar-body': this.dom.startWeekCalendarBody,
            'end-week-calendar-body': this.dom.endWeekCalendarBody,
            'month-picker-body': this.dom.monthBody,
            'start-month-picker-body': this.dom.startMonthBody,
            'end-month-picker-body': this.dom.endMonthBody,
            'year-picker-body': this.dom.yearBody,
            'start-year-picker-body': this.dom.startYearBody,
            'end-year-picker-body': this.dom.endYearBody
        };
    }

    getPickerBodyById(id) {
        if (!id || !this.picker) return null;
        if (this.domById && this.domById[id]) {
            const el = this.domById[id];
            if (el && el.isConnected) return el;
        }
        const next = this.picker.querySelector(`#${id}`);
        if (this.domById) this.domById[id] = next;
        return next;
    }

    bindPickerDelegatedEvents() {
        if (!this.picker) return;
        if (this._onPickerClick) return;

        this._onPickerClick = (event) => {
            const target = event.target;
            if (!target) return;

            const dropdownLabel = target.closest('.zhenshangyin-time-dropdown .zhenshangyin-dropdown-label');
            if (dropdownLabel && this.picker && this.picker.contains(dropdownLabel)) {
                event.stopPropagation();
                const dropdown = dropdownLabel.closest('.zhenshangyin-time-dropdown');
                const scrollContainer = dropdown ? dropdown.querySelector('.zhenshangyin-scroll-container') : null;
                if (!scrollContainer) return;
                const willOpen = scrollContainer.style.display === 'none' || !scrollContainer.style.display;
                scrollContainer.style.display = willOpen ? 'block' : 'none';
                if (willOpen) {
                    requestAnimationFrame(() => {
                        if (!this.picker) return;
                        const hoursScroll = scrollContainer.querySelector('[id$="hours-scroll"]');
                        const minutesScroll = scrollContainer.querySelector('[id$="minutes-scroll"]');
                        const secondsScroll = scrollContainer.querySelector('[id$="seconds-scroll"]');
                        const ctx = this.getTimeScrollContextFromElement(hoursScroll || minutesScroll || secondsScroll);
                        const t = ctx?.time || this.selectedTime;

                        if (this.showHours && hoursScroll) {
                            const idx = Math.max(0, this.availableHours.indexOf(t.hours));
                            this.dropdownCenterScroll(hoursScroll, idx);
                            this.updateDropdownSelected(hoursScroll, idx);
                            this.createCustomScrollbar(hoursScroll);
                        }
                        if (this.showMinutes && minutesScroll) {
                            const idx = Math.max(0, this.availableMinutes.indexOf(t.minutes));
                            this.dropdownCenterScroll(minutesScroll, idx);
                            this.updateDropdownSelected(minutesScroll, idx);
                            this.createCustomScrollbar(minutesScroll);
                        }
                        if (this.showSeconds && secondsScroll) {
                            const idx = Math.max(0, this.availableSeconds.indexOf(t.seconds));
                            this.dropdownCenterScroll(secondsScroll, idx);
                            this.updateDropdownSelected(secondsScroll, idx);
                            this.createCustomScrollbar(secondsScroll);
                        }
                    });
                }
                return;
            }

            const confirmConfirm = target.closest('.zhenshangyin-confirm-confirm');
            if (confirmConfirm && this.picker && this.picker.contains(confirmConfirm)) {
                event.stopPropagation();
                const scrollContainer = confirmConfirm.closest('.zhenshangyin-scroll-container');
                if (scrollContainer) scrollContainer.style.display = 'none';
                return;
            }

            const scrollItem = target.closest('.zhenshangyin-scroll-item');
            if (scrollItem && this.picker && this.picker.contains(scrollItem)) {
                if (scrollItem.classList.contains('placeholder')) return;
                const scrollElement = scrollItem.closest('.zhenshangyin-time-scroll');
                const ctx = this.getTimeScrollContextFromElement(scrollElement);
                if (!ctx) return;

                const contentElement = this.getScrollContentElement(scrollElement);
                const items = Array.from(contentElement.querySelectorAll('.zhenshangyin-scroll-item:not(.placeholder)'));
                const idx = items.indexOf(scrollItem);
                if (idx < 0) return;

                const values = ctx.unit === 'hours' ? this.availableHours : (ctx.unit === 'minutes' ? this.availableMinutes : this.availableSeconds);
                const val = values[idx] ?? idx;
                ctx.time[ctx.unit] = val;

                const dropdown = scrollElement.closest('.zhenshangyin-time-dropdown');
                const label = dropdown ? dropdown.querySelector('.zhenshangyin-dropdown-label') : null;
                if (label) label.textContent = this.formatTime(ctx.time);

                this.dropdownCenterScroll(scrollElement, idx);
                this.updateDropdownSelected(scrollElement, idx);
                this.createCustomScrollbar(scrollElement);
                return;
            }

            const confirmBtn = target.closest('.zhenshangyin-confirm-btn');
            if (confirmBtn && this.picker && this.picker.contains(confirmBtn)) {
                this.handleConfirm();
                return;
            }

            const panelButton = target.closest('button[data-yearmonthpanel],button[data-yearpanel]');
            if (panelButton && this.picker && this.picker.contains(panelButton)) {
                const yearMonthKey = panelButton.dataset.yearmonthpanel;
                const yearPanelKey = panelButton.dataset.yearpanel;

                if (yearMonthKey && this[yearMonthKey]) {
                    const state = this[yearMonthKey];
                    if (panelButton.classList.contains('zhenshangyin-prev-decade')) {
                        state.baseYear -= 10;
                        this.renderYearMonthPanel(yearMonthKey, 'year');
                        return;
                    }
                    if (panelButton.classList.contains('zhenshangyin-next-decade')) {
                        state.baseYear += 10;
                        this.renderYearMonthPanel(yearMonthKey, 'year');
                        return;
                    }
                    if (panelButton.classList.contains('zhenshangyin-prev-year-yearmonthpanel')) {
                        state.setYear(state.getYear() - 1);
                        state.baseYear = state.getYear();
                        this.renderYearMonthPanel(yearMonthKey, 'month');
                        return;
                    }
                    if (panelButton.classList.contains('zhenshangyin-next-year-yearmonthpanel')) {
                        state.setYear(state.getYear() + 1);
                        state.baseYear = state.getYear();
                        this.renderYearMonthPanel(yearMonthKey, 'month');
                        return;
                    }
                }

                if (yearPanelKey && this[yearPanelKey]) {
                    const state = this[yearPanelKey];
                    if (panelButton.classList.contains('zhenshangyin-prev-decade')) {
                        state.baseYear -= 10;
                        this.renderYearPanel(yearPanelKey);
                        return;
                    }
                    if (panelButton.classList.contains('zhenshangyin-next-decade')) {
                        state.baseYear += 10;
                        this.renderYearPanel(yearPanelKey);
                        return;
                    }
                }
            }

            const panelCell = target.closest('td[data-yearmonthpanel]');
            if (panelCell && this.picker && this.picker.contains(panelCell)) {
                const key = panelCell.dataset.yearmonthpanel;
                const state = key ? this[key] : null;
                if (state && state.panelType === 'yearMonth') {
                    if (panelCell.classList.contains('zhenshangyin-custom-disabled')) return;
                    if (panelCell.dataset.month) {
                        const monthNumber = parseInt(panelCell.dataset.month, 10);
                        if (isNaN(monthNumber)) return;
                        state.setMonth(monthNumber - 1);
                        this.restoreYearMonthPanel(key);
                        if (state.onAfterMonthSelected) state.onAfterMonthSelected();
                        return;
                    }
                    if (panelCell.dataset.year) {
                        const year = parseInt(panelCell.dataset.year, 10);
                        if (isNaN(year)) return;
                        state.setYear(year);
                        state.baseYear = year;
                        this.renderYearMonthPanel(key, 'month');
                        return;
                    }
                }

                if (state && state.panelType === 'yearOnly') {
                    if (panelCell.classList.contains('zhenshangyin-custom-disabled')) return;
                    const year = parseInt(panelCell.dataset.year, 10);
                    if (isNaN(year)) return;
                    state.setYear(year);
                    this.restoreYearMonthPanel(key);
                    if (state.onAfterYearSelected) state.onAfterYearSelected();
                    return;
                }
            }

            const yearLabel = target.closest('.zhenshangyin-current-year');
            if (yearLabel && this.picker && this.picker.contains(yearLabel)) {
                const type = yearLabel.dataset.type || '';
                if (this.type === 'date') {
                    this.openDateYearMonthPanel('year');
                    return;
                }
                if (this.type === 'dateRange') {
                    if (type) this.openDateRangeYearMonthPanelWithView(type, 'year');
                    return;
                }
                if (this.type === 'week') {
                    this.openWeekYearMonthPanel('year');
                    return;
                }
            }

            const monthLabel = target.closest('.zhenshangyin-current-month');
            if (monthLabel && this.picker && this.picker.contains(monthLabel)) {
                const type = monthLabel.dataset.type || '';
                if (this.type === 'date') {
                    this.openDateYearMonthPanel('month');
                    return;
                }
                if (this.type === 'dateRange') {
                    if (type) this.openDateRangeYearMonthPanelWithView(type, 'month');
                    return;
                }
                if (this.type === 'week') {
                    this.openWeekYearMonthPanel('month');
                    return;
                }
            }

            const display = target.closest('.zhenshangyin-current-display');
            if (display && this.picker && this.picker.contains(display)) {
                const type = display.dataset.type || '';
                if (this.type === 'month') {
                    this.openMonthYearPanel();
                    return;
                }
                if (this.type === 'monthRange') {
                    if (type) this.openMonthRangeYearPanel(type, display);
                    return;
                }
            }

            const navBtn = target.closest('button');
            if (navBtn && this.picker && this.picker.contains(navBtn)) {
                const type = navBtn.dataset.type || '';

                if (navBtn.classList.contains('zhenshangyin-prev-year')) {
                    this.changeYear(-1, type);
                    return;
                }
                if (navBtn.classList.contains('zhenshangyin-next-year')) {
                    this.changeYear(1, type);
                    return;
                }
                if (navBtn.classList.contains('zhenshangyin-prev-month')) {
                    this.changeMonth(-1, type);
                    return;
                }
                if (navBtn.classList.contains('zhenshangyin-next-month')) {
                    this.changeMonth(1, type);
                    return;
                }

                if (navBtn.classList.contains('zhenshangyin-prev-decade')) {
                    const step = this.type === 'yearRange' ? 12 : 10;
                    this.changeDecade(-step, type);
                    return;
                }
                if (navBtn.classList.contains('zhenshangyin-next-decade')) {
                    const step = this.type === 'yearRange' ? 12 : 10;
                    this.changeDecade(step, type);
                    return;
                }
            }

            const shortcutBtn = target.closest('.zhenshangyin-shortcut-btn');
            if (shortcutBtn && this.picker && this.picker.contains(shortcutBtn)) {
                const idx = parseInt(shortcutBtn.dataset.shortcutIndex, 10);
                if (isNaN(idx)) return;
                const shortcuts = this.getShortcuts();
                if (!shortcuts.length) return;
                this.runShortcut(shortcuts[idx]);
                return;
            }

            const weekRow = target.closest('tr[data-week-row="1"]');
            if (weekRow && this.picker && this.picker.contains(weekRow)) {
                const type = weekRow.dataset.type || '';
                const dateCells = weekRow.querySelectorAll('td[data-date]');
                const weekDates = Array.from(dateCells).map(td => this.parseDateKey(td.dataset.date));
                if (weekDates.length === 7 && weekDates.every(d => d && !isNaN(d.getTime()))) {
                    this.selectWeek(weekDates, type);
                }
                return;
            }

            const td = target.closest('td');
            if (!td || !this.picker || !this.picker.contains(td)) return;
            if (td.classList.contains('zhenshangyin-custom-disabled')) return;
            if (td.dataset.yearmonthpanel) return;

            const type = td.dataset.type || '';
            if (td.dataset.date) {
                const d = this.parseDateKey(td.dataset.date);
                if (d && !isNaN(d.getTime())) this.selectDate(d, type);
                return;
            }
            if (td.dataset.month) {
                const y = parseInt(td.dataset.year, 10);
                const m = parseInt(td.dataset.month, 10);
                if (!isNaN(y) && !isNaN(m)) this.selectMonth(y, m, type);
                return;
            }
            if (td.dataset.year) {
                const y = parseInt(td.dataset.year, 10);
                if (!isNaN(y)) this.selectYear(y, type);
            }
        };
        this.picker.addEventListener('click', this._onPickerClick);

        this._onPickerMouseOver = (event) => {
            const target = event.target;
            if (!target) return;

            if (this.type === 'dateRange') {
                const td = target.closest('td[data-date]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startDate && !this.endDate) {
                        const d = this.parseDateKey(td.dataset.date);
                        if (d && !isNaN(d.getTime())) this.scheduleHoverRangeUpdate({ mode: 'date', value: d });
                    }
                    return;
                }
            }

            if (this.type === 'monthRange') {
                const td = target.closest('td[data-year][data-month]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startMonth && !this.endMonth) {
                        const y = parseInt(td.dataset.year, 10);
                        const m = parseInt(td.dataset.month, 10);
                        if (!isNaN(y) && !isNaN(m)) this.scheduleHoverRangeUpdate({ mode: 'month', value: new Date(y, m - 1, 1) });
                    }
                    return;
                }
            }

            if (this.type === 'yearRange') {
                const td = target.closest('td[data-year]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startYear && !this.endYear) {
                        const y = parseInt(td.dataset.year, 10);
                        if (!isNaN(y)) this.scheduleHoverRangeUpdate({ mode: 'year', value: y });
                    }
                    return;
                }
            }

            const row = target.closest('tr[data-week-row="1"]');
            if (!row || !this.picker || !this.picker.contains(row)) return;
            const related = event.relatedTarget;
            if (related && row.contains(related)) return;
            this.highlightWeek(row, true);
        };

        this._onPickerMouseOut = (event) => {
            const target = event.target;
            if (!target) return;

            if (this.type === 'dateRange') {
                const td = target.closest('td[data-date]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startDate && !this.endDate) {
                        this.cancelHoverRangeUpdate();
                        this.applyRangeStyles();
                    }
                    return;
                }
            }

            if (this.type === 'monthRange') {
                const td = target.closest('td[data-year][data-month]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startMonth && !this.endMonth) {
                        this.cancelHoverRangeUpdate();
                        this.applyRangeStyles();
                    }
                    return;
                }
            }

            if (this.type === 'yearRange') {
                const td = target.closest('td[data-year]');
                if (td && this.picker && this.picker.contains(td) && !td.dataset.yearmonthpanel) {
                    const related = event.relatedTarget;
                    if (related && td.contains(related)) return;
                    if (this.startYear && !this.endYear) {
                        this.cancelHoverRangeUpdate();
                        this.applyRangeStyles();
                    }
                    return;
                }
            }

            const row = target.closest('tr[data-week-row="1"]');
            if (!row || !this.picker || !this.picker.contains(row)) return;
            const related = event.relatedTarget;
            if (related && row.contains(related)) return;
            this.highlightWeek(row, false);
        };

        this.picker.addEventListener('mouseover', this._onPickerMouseOver);
        this.picker.addEventListener('mouseout', this._onPickerMouseOut);
    }

    lockPickerContentWidth() {
        if (!this.picker) return;
        if (this._pickerContentWidthLocked) return;

        if (window.innerWidth <= 768) return;

        const main = this.picker.querySelector('.zhenshangyin-shortcuts-main');
        if (main) {
            const w = Math.ceil(main.getBoundingClientRect().width);
            if (w > 0) {
                main.style.width = `${w}px`;
                main.style.flex = '0 0 auto';
                this._pickerContentWidthLocked = true;
                return;
            }
        }

        const w = Math.ceil(this.picker.getBoundingClientRect().width);
        if (w > 0) {
            this.picker.style.width = `${w}px`;
            this._pickerContentWidthLocked = true;
        }
    }

    getPickerClassName() {
        let baseClass = `zhenshangyin-custom-calendar ${this.uniqueClassName}`;
        if (this.isRangeType() && this.type !== 'timeRange') {
            baseClass += ' zhenshangyin-date-range-calendar';
            if (this.type === 'yearRange' || this.type === 'monthRange') {
                baseClass += ' zhenshangyin-date-range-yearrange';
            }
        }
        if (this.type === 'year' || this.type === 'month') {
            baseClass += ' zhenshangyin-year-month-picker';
        }
        if (this.type === 'timeRange') {
            baseClass += ' zhenshangyin-time-range-picker';
        }
        return baseClass;
    }

    getPickerHTML() {
        const htmlMethods = {
            date: () => this.createDatePickerHTML(),
            dateRange: () => this.createDateRangePickerHTML(),
            week: () => this.createWeekPickerHTML(),
            month: () => this.createMonthPickerHTML(),
            monthRange: () => this.createMonthRangePickerHTML(),
            year: () => this.createYearPickerHTML(),
            yearRange: () => this.createYearRangePickerHTML(),
            time: () => this.createStandaloneTimePickerHTML(),
            timeRange: () => this.createStandaloneTimePickerHTML()
        };
        const html = (htmlMethods[this.type] || htmlMethods.date)();
        return this.wrapWithShortcuts(html);
    }

    createDatePickerHTML() {
        const weekdayNames = this.getWeekdayNames();
        let html = `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-year">${this.getNavigationIcon('prev-double')}</button>
                <button class="zhenshangyin-prev-month">${this.getNavigationIcon('prev')}</button>
                <div class="zhenshangyin-current-display">
                    <div class="zhenshangyin-current-year">${this.currentYear}${this.language === 'en' ? ' Year' : '年'}</div>
                    <div class="zhenshangyin-current-month">${this.currentMonth + 1}${this.language === 'en' ? ' Month' : '月'}</div>
                </div>
                <button class="zhenshangyin-next-month">${this.getNavigationIcon('next')}</button>
                <button class="zhenshangyin-next-year">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><thead><tr>${weekdayNames.map(name => `<th>${name}</th>`).join('')}</tr></thead><tbody id="calendar-body"></tbody></table>
            </div>
        `;
        if (this.showTime) {
            html += this.createTimePickerHTML();
        } else if (this.multiSelect) {
            html += `
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-confirm-btn">${this.language === 'en' ? 'Confirm' : '确认'}</button>
            </div>`;
        }
        return html;
    }

    createDateRangePickerHTML() {
        return `
            <div class="zhenshangyin-date-range-container">
                <div class="zhenshangyin-date-picker-wrapper">${this.createSingleDatePickerHTML('start')}</div>
                <div class="zhenshangyin-date-picker-wrapper">${this.createSingleDatePickerHTML('end')}</div>
            </div>
            ${this.showTime ? `
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-confirm-btn">${this.language === 'en' ? 'Confirm' : '确认'}</button>
            </div>` : ''}
        `;
    }

    createSingleDatePickerHTML(type) {
        const weekdayNames = this.getWeekdayNames();
        const year = type === 'start' ? this.startYear : this.endYear;
        const month = type === 'start' ? this.startMonth : this.endMonth;

        let html = `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-year" data-type="${type}">${this.getNavigationIcon('prev-double')}</button>
                <button class="zhenshangyin-prev-month" data-type="${type}">${this.getNavigationIcon('prev')}</button>
                <div class="zhenshangyin-current-display" data-type="${type}">
                    <div class="zhenshangyin-current-year" data-type="${type}">${year}${this.language === 'en' ? ' Year' : '年'}</div>
                    <div class="zhenshangyin-current-month" data-type="${type}">${month + 1}${this.language === 'en' ? ' Month' : '月'}</div>
                </div>
                <button class="zhenshangyin-next-month" data-type="${type}">${this.getNavigationIcon('next')}</button>
                <button class="zhenshangyin-next-year" data-type="${type}">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><thead><tr>${weekdayNames.map(name => `<th>${name}</th>`).join('')}</tr></thead><tbody id="${type}-calendar-body"></tbody></table>
            </div>
        `;
        if (this.showTime) html += this.createRangeTimePickerHTML(type);
        return html;
    }

    createWeekPickerHTML() {
        const weekdayNames = this.getWeekdayNames();
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-year">${this.getNavigationIcon('prev-double')}</button>
                <button class="zhenshangyin-prev-month">${this.getNavigationIcon('prev')}</button>
                <div class="zhenshangyin-current-display">
                    <div class="zhenshangyin-current-year">${this.currentYear}${this.language === 'en' ? ' Year' : '年'}</div>
                    <div class="zhenshangyin-current-month">${this.currentMonth + 1}${this.language === 'en' ? ' Month' : '月'}</div>
                </div>
                <button class="zhenshangyin-next-month">${this.getNavigationIcon('next')}</button>
                <button class="zhenshangyin-next-year">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><thead><tr>${weekdayNames.map(name => `<th>${name}</th>`).join('')}</tr></thead><tbody id="week-calendar-body"></tbody></table>
            </div>
        `;
    }

    createMonthPickerHTML() {
        const monthNames = this.getMonthNames();
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-year">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display">${this.currentYear}${this.language === 'en' ? ' Year' : '年'}</span>
                <button class="zhenshangyin-next-year">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><tbody id="month-picker-body">
                    <tr><td>${monthNames[0]}</td><td>${monthNames[1]}</td><td>${monthNames[2]}</td></tr>
                    <tr><td>${monthNames[3]}</td><td>${monthNames[4]}</td><td>${monthNames[5]}</td></tr>
                    <tr><td>${monthNames[6]}</td><td>${monthNames[7]}</td><td>${monthNames[8]}</td></tr>
                    <tr><td>${monthNames[9]}</td><td>${monthNames[10]}</td><td>${monthNames[11]}</td></tr>
                </tbody></table>
            </div>
            ${this.multiSelect ? `
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-confirm-btn">${this.language === 'en' ? 'Confirm' : '确认'}</button>
            </div>` : ''}
        `;
    }

    createMonthRangePickerHTML() {
        return `
            <div class="zhenshangyin-date-range-container">
                <div class="zhenshangyin-month-picker-wrapper">${this.createSingleMonthPickerHTML('start')}</div>
                <div class="zhenshangyin-month-picker-wrapper">${this.createSingleMonthPickerHTML('end')}</div>
            </div>
        `;
    }

    createSingleMonthPickerHTML(type) {
        const monthNames = this.getMonthNames();
        const year = type === 'start' ? this.currentYear : this.endYear;
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-year" data-type="${type}">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display" data-type="${type}">${year}${this.language === 'en' ? ' Year' : '年'}</span>
                <button class="zhenshangyin-next-year" data-type="${type}">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><tbody id="${type}-month-picker-body">
                    <tr><td>${monthNames[0]}</td><td>${monthNames[1]}</td><td>${monthNames[2]}</td></tr>
                    <tr><td>${monthNames[3]}</td><td>${monthNames[4]}</td><td>${monthNames[5]}</td></tr>
                    <tr><td>${monthNames[6]}</td><td>${monthNames[7]}</td><td>${monthNames[8]}</td></tr>
                    <tr><td>${monthNames[9]}</td><td>${monthNames[10]}</td><td>${monthNames[11]}</td></tr>
                </tbody></table>
            </div>
        `;
    }

    createYearPickerHTML() {
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-decade">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display">${this.getDecadeRange()}</span>
                <button class="zhenshangyin-next-decade">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><tbody id="year-picker-body"></tbody></table>
            </div>
            ${this.multiSelect ? `
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-confirm-btn">${this.language === 'en' ? 'Confirm' : '确认'}</button>
            </div>` : ''}
        `;
    }

    createYearRangePickerHTML() {
        return `
            <div class="zhenshangyin-date-range-container">
                <div class="zhenshangyin-year-picker-wrapper">${this.createSingleYearPickerHTML('start')}</div>
                <div class="zhenshangyin-year-picker-wrapper">${this.createSingleYearPickerHTML('end')}</div>
            </div>
        `;
    }

    createSingleYearPickerHTML(type) {
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-decade" data-type="${type}">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display" data-type="${type}">${this.getDecadeRange(type)}</span>
                <button class="zhenshangyin-next-decade" data-type="${type}">${this.getNavigationIcon('next-double')}</button>
            </div>
            <div class="zhenshangyin-table-container">
                <table><tbody id="${type}-year-picker-body"></tbody></table>
            </div>
        `;
    }

    createTimePickerHTML(type = '') {
        const timeText = this.language === 'zh' ? '时间' : 'Time';
        const confirmText = this.language === 'zh' ? '确认' : 'Confirm';
        const nowText = this.language === 'zh' ? '此刻' : 'Now';

        const timeScrolls = [];
        if (this.showHours) {
            timeScrolls.push(`
                <div class="zhenshangyin-time-scroll" id="hours-scroll">
                    <div class="zhenshangyin-time-scroll-content">
                        ${this.createPlaceholder()}
                        ${this.availableHours.map((hour, index) => `<div class="zhenshangyin-scroll-item${index === 0 ? ' selected' : ''}">${String(hour).padStart(2, '0')}</div>`).join('')}
                        ${this.createPlaceholder()}
                    </div>
                </div>
            `);
        }
        if (this.showMinutes) {
            timeScrolls.push(`
                <div class="zhenshangyin-time-scroll" id="minutes-scroll">
                    <div class="zhenshangyin-time-scroll-content">
                        ${this.createPlaceholder()}
                        ${this.availableMinutes.map((minute, index) => `<div class="zhenshangyin-scroll-item${index === 0 ? ' selected' : ''}">${String(minute).padStart(2, '0')}</div>`).join('')}
                        ${this.createPlaceholder()}
                    </div>
                </div>
            `);
        }
        if (this.showSeconds) {
            timeScrolls.push(`
                <div class="zhenshangyin-time-scroll" id="seconds-scroll">
                    <div class="zhenshangyin-time-scroll-content">
                        ${this.createPlaceholder()}
                        ${this.availableSeconds.map((second, index) => `<div class="zhenshangyin-scroll-item${index === 0 ? ' selected' : ''}">${String(second).padStart(2, '0')}</div>`).join('')}
                        ${this.createPlaceholder()}
                    </div>
                </div>
            `);
        }

        return `
            <div class="zhenshangyin-time-picker">
                <div class="zhenshangyin-current-tame">${timeText}</div>
                <div class="zhenshangyin-time-dropdown" id="zhenshangyin-time-dropdown">
                    <div class="zhenshangyin-dropdown-label">${this.formatTime()}</div>
                    <div class="zhenshangyin-scroll-container" style="display: none;">
                        <div class="zhenshangyin-scroll-scroll">
                            ${timeScrolls.join('')}
                        </div>
                        <button class="zhenshangyin-confirm-confirm">${confirmText}</button>
                    </div>
                </div>
                <button class="zhenshangyin-current-time-btn">${nowText}</button>
                <button class="zhenshangyin-confirm-btn">${confirmText}</button>
            </div>
            `;
    }

    createRangeTimePickerHTML(type) {
        const time = type === 'start' ? this.startTime : this.endTime;
        const dropdownId = `${type}-zhenshangyin-time-dropdown`;
        const hoursId = `${type}-hours-scroll`;
        const minutesId = `${type}-minutes-scroll`;
        const secondsId = `${type}-seconds-scroll`;
        const dateLabel = this.formatDateOnlyForRange(type);
        return `
            <div class="zhenshangyin-time-picker">
                <div class="zhenshangyin-date-label" data-type="${type}">${dateLabel}</div>
                <div class="zhenshangyin-time-dropdown" id="${dropdownId}">
                    <div class="zhenshangyin-dropdown-label">${this.formatTime(time)}</div>
                    <div class="zhenshangyin-scroll-container" style="display: none;">
                        <div class="zhenshangyin-scroll-scroll">
                            ${this.showHours ? `
                            <div class="zhenshangyin-time-scroll" id="${hoursId}">
                                <div class="zhenshangyin-time-scroll-content">
                                    ${this.createPlaceholder()}
                                    ${this.availableHours.map((h) => `<div class=\"zhenshangyin-scroll-item${h === time.hours ? ' selected' : ''}\">${String(h).padStart(2, '0')}</div>`).join('')}
                                    ${this.createPlaceholder()}
                                </div>
                            </div>` : ''}
                            ${this.showMinutes ? `
                            <div class="zhenshangyin-time-scroll" id="${minutesId}">
                                <div class="zhenshangyin-time-scroll-content">
                                    ${this.createPlaceholder()}
                                    ${this.availableMinutes.map((m) => `<div class=\"zhenshangyin-scroll-item${m === time.minutes ? ' selected' : ''}\">${String(m).padStart(2, '0')}</div>`).join('')}
                                    ${this.createPlaceholder()}
                                </div>
                            </div>` : ''}
                            ${this.showSeconds ? `
                            <div class="zhenshangyin-time-scroll" id="${secondsId}">
                                <div class="zhenshangyin-time-scroll-content">
                                    ${this.createPlaceholder()}
                                    ${this.availableSeconds.map((s) => `<div class=\"zhenshangyin-scroll-item${s === time.seconds ? ' selected' : ''}\">${String(s).padStart(2, '0')}</div>`).join('')}
                                    ${this.createPlaceholder()}
                                </div>
                            </div>` : ''}
                        </div>
                        <button class="zhenshangyin-confirm-confirm">${this.language === 'en' ? 'Confirm' : '确认'}</button>
                    </div>
                </div>
            </div>
        `;
    }

    createPlaceholder() {
        return Array.from({ length: 2 }, () => `<div class="zhenshangyin-scroll-item placeholder"></div>`).join('');
    }



    getNavigationIcon(type) {
        const icons = {
            'prev-double': '<svg viewBox="0 0 1024 1024"><path d="M129.6 527.5L521 918.9c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.4-24.6 0-33.9L180.5 510.5 552 139c9.4-9.4 9.4-24.6 0-33.9-4.7-4.7-10.8-7-17-7s-12.3 2.3-17 7L129.6 493.6c-9.4 9.3-9.4 24.5 0 33.9z" fill="#AAAAAA"/><path d="M464 510.5c0 6.4 2.5 12.5 7 17l391.4 391.4c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.4-24.6 0-33.9L522 510.5 893.5 139c9.4-9.4 9.4-24.6 0-33.9-4.7-4.7-10.8-7-17-7s-12.3 2.3-17 7L471.1 493.6c-4.5 4.5-7.1 10.6-7.1 16.9z" fill="#AAAAAA"/></svg>',
            'prev': '<svg viewBox="0 0 1024 1024"><path d="M129.6 527.5L521 918.9c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.4-24.6 0-33.9L180.5 510.5 552 139c9.4-9.4 9.4-24.6 0-33.9-4.7-4.7-10.8-7-17-7s-12.3 2.3-17 7L129.6 493.6c-9.4 9.3-9.4 24.5 0 33.9z" fill="#AAAAAA"/></svg>',
            'next': '<svg viewBox="0 0 1024 1024"><path d="M896.4 496.5L505 105.1c-9.4-9.4-24.6-9.4-33.9 0-9.4 9.4-9.4 24.6 0 33.9l374.4 374.4L474 885c-9.4 9.4-9.4 24.6 0 33.9 4.7 4.7 10.8 7 17 7s12.3-2.3 17-7l388.5-388.5c9.3-9.3 9.3-24.5-0.1-33.9z" fill="#AAAAAA"/></svg>',
            'next-double': '<svg viewBox="0 0 1024 1024"><path d="M896.4 496.5L505 105.1c-9.4-9.4-24.6-9.4-33.9 0-9.4 9.4-9.4 24.6 0 33.9l374.4 374.4L474 885c-9.4 9.4-9.4 24.6 0 33.9 4.7 4.7 10.8 7 17 7s12.3-2.3 17-7l388.5-388.5c9.3-9.3 9.3-24.5-0.1-33.9z" fill="#AAAAAA"/><path d="M561.9 513.5c0-6.4-2.5-12.5-7-17L163.5 105.1c-9.4-9.4-24.6-9.4-33.9 0-9.4 9.4-9.4 24.6 0 33.9L504 513.5 132.5 885c-9.4 9.4-9.4 24.6 0 33.9 4.7 4.7 10.8 7 17 7s12.3-2.3 17-7L555 530.4c4.4-4.5 6.9-10.6 6.9-16.9z" fill="#AAAAAA"/></svg>'
        };
        return icons[type] || icons.prev;
    }

    getMonthNames() {
        return this.language === 'zh' ?
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    getWeekdayNames() {
        return this.language === 'zh' ?
            ['日', '一', '二', '三', '四', '五', '六'] :
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }

    getDecadeRange(type = '') {
        let baseYear = this.currentYear;
        if (this.type === 'yearRange') {
            if (type === 'start') baseYear = this.startPanelYear;
            else if (type === 'end') baseYear = this.endPanelYear;
        }
        let startYear;
        if (this.type === 'yearRange' && type === 'end') {
            startYear = baseYear;
        } else {
            startYear = Math.floor(baseYear / 10) * 10;
        }
        const endYear = startYear + 11;
        return `${startYear}${this.language === 'en' ? ' - ' : '年 - '}${endYear}${this.language === 'en' ? '' : '年'}`;
    }

    syncYearRangePanelYears() {
        if (this.type !== 'yearRange') return;
        const s = (typeof this.startYear === 'number' && !isNaN(this.startYear)) ? this.startYear : null;
        const e = (typeof this.endYear === 'number' && !isNaN(this.endYear)) ? this.endYear : null;
        if (s === null && e === null) return;

        const minYear = Math.min(s ?? e, e ?? s);
        const maxYear = Math.max(s ?? e, e ?? s);
        const leftDecadeStart = Math.floor(minYear / 10) * 10;

        this.startPanelYear = minYear;

        if (maxYear <= leftDecadeStart + 23) {
            this.endPanelYear = leftDecadeStart + 12;
        } else {
            this.endPanelYear = Math.floor(maxYear / 10) * 10;
        }
    }

    setupPickerEvents() {
        switch (this.type) {
            case 'date':
                this.setupDatePickerEvents();
                break;
            case 'dateRange':
                this.setupDateRangePickerEvents();
                break;
            case 'week':
                this.setupWeekPickerEvents();
                break;
            case 'month':
                this.setupMonthPickerEvents();
                break;
            case 'monthRange':
                this.setupMonthRangePickerEvents();
                break;
            case 'year':
                this.setupYearPickerEvents();
                break;
            case 'yearRange':
                this.setupYearRangePickerEvents();
                break;
            case 'time':
            case 'timeRange':
                this.setupTimePickerEvents();
                break;
        }

        if (this.shouldShowShortcuts()) {
            this.setupShortcutsEvents();
        }
    }

    setupDatePickerEvents() {
        this.populateCalendar();
        if (this.showTime) this.setupTimeDropdowns();
        if (this.multiSelect && !this.showTime) {
            this.dom && (this.dom.confirmBtn = this.picker.querySelector('.zhenshangyin-confirm-btn'));
        }
    }

    openDateYearMonthPanel(initialView = 'year') {
        if (!this.picker) return;
        const container = this.picker.querySelector('.zhenshangyin-table-container');
        if (!container) return;
        const nav = this.picker.querySelector('.zhenshangyin-custom-navigation');
        this.openYearMonthPanel({
            stateKey: '_datePanelState',
            container,
            nav,
            baseYear: this.currentYear,
            yearBodyId: 'date-year-picker-body',
            monthBodyId: 'date-month-picker-body',
            getYear: () => this.currentYear,
            setYear: (y) => { this.currentYear = y; },
            getMonth: () => this.currentMonth,
            setMonth: (m) => { this.currentMonth = m; },
            onAfterMonthSelected: () => this.updateCalendar(),
            initialView,
            removeSelectors: ['.zhenshangyin-button-container', '.zhenshangyin-time-picker']
        });
    }

    openWeekYearMonthPanel(initialView = 'year') {
        if (!this.picker) return;
        const container = this.picker.querySelector('.zhenshangyin-table-container');
        if (!container) return;
        const nav = this.picker.querySelector('.zhenshangyin-custom-navigation');
        this.openYearMonthPanel({
            stateKey: '_weekPanelState',
            container,
            nav,
            baseYear: this.currentYear,
            yearBodyId: 'week-year-picker-body',
            monthBodyId: 'week-month-picker-body',
            getYear: () => this.currentYear,
            setYear: (y) => { this.currentYear = y; },
            getMonth: () => this.currentMonth,
            setMonth: (m) => { this.currentMonth = m; },
            onAfterMonthSelected: () => this.updateCalendar(),
            initialView
        });
    }

    openMonthYearPanel() {
        if (!this.picker) return;
        const container = this.picker.querySelector('.zhenshangyin-table-container');
        if (!container) return;
        const nav = this.picker.querySelector('.zhenshangyin-custom-navigation');
        this.openYearPanel({
            stateKey: '_monthPanelState',
            container,
            nav,
            baseYear: this.currentYear,
            yearBodyId: 'month-year-picker-body',
            getYear: () => this.currentYear,
            setYear: (y) => { this.currentYear = y; },
            onAfterYearSelected: () => {
                this.restoreYearMonthPanel('_monthPanelState');
                this.updateCalendar();
            }
        });
    }

    openMonthRangeYearPanel(type) {
        if (!this.picker) return;
        const monthBody = this.picker.querySelector(`#${type}-month-picker-body`);
        const container = monthBody ? monthBody.closest('.zhenshangyin-table-container') : null;
        if (!container) return;
        const nav = this.picker
            .querySelector(`.zhenshangyin-custom-navigation .zhenshangyin-current-display[data-type="${type}"]`)
            ?.closest('.zhenshangyin-custom-navigation');

        const stateKey = type === 'start' ? '_monthRangeStartPanelState' : '_monthRangeEndPanelState';
        this.openYearPanel({
            stateKey,
            container,
            nav,
            baseYear: type === 'start' ? this.currentYear : this.endYear,
            yearBodyId: `${type}-monthrange-year-picker-body`,
            getYear: () => (type === 'start' ? this.currentYear : this.endYear),
            setYear: (y) => { if (type === 'start') this.currentYear = y; else this.endYear = y; },
            onAfterYearSelected: () => {
                this.restoreYearMonthPanel(stateKey);
                this.updateCalendar(type);
            }
        });
    }

    createPanelNavigationHTML({ prevClass, nextClass, titleClass, titleText, iconPrev = 'prev-double', iconNext = 'next-double' }) {
        return `
            <div class="zhenshangyin-custom-navigation">
                <button class="${prevClass}">${this.getNavigationIcon(iconPrev)}</button>
                <span class="zhenshangyin-current-display ${titleClass}">${titleText}</span>
                <button class="${nextClass}">${this.getNavigationIcon(iconNext)}</button>
            </div>
        `;
    }

    openYearMonthPanel({
        stateKey,
        container,
        nav,
        baseYear,
        yearBodyId,
        monthBodyId,
        getYear,
        setYear,
        getMonth,
        setMonth,
        onAfterMonthSelected,
        initialView = 'year',
        removeSelectors = []
    }) {
        if (!this.picker || !container) return;

        if (this[stateKey]) {
            this.restoreYearMonthPanel(stateKey);
        }

        let navPlaceholder = null;
        if (nav && nav.parentNode) {
            navPlaceholder = document.createComment(`${stateKey}-nav-placeholder`);
            nav.parentNode.replaceChild(navPlaceholder, nav);
        }

        const removedPairs = [];
        removeSelectors.forEach(selector => {
            const nodes = Array.from(this.picker.querySelectorAll(selector));
            nodes.forEach((node, idx) => {
                if (!node || !node.parentNode) return;
                const placeholder = document.createComment(`${stateKey}-${selector}-placeholder-${idx}`);
                node.parentNode.replaceChild(placeholder, node);
                removedPairs.push({ node, placeholder });
            });
        });

        this[stateKey] = {
            panelType: 'yearMonth',
            container,
            originalHTML: container.innerHTML,
            nav,
            navPlaceholder,
            removedPairs,
            baseYear: typeof baseYear === 'number' ? baseYear : this.currentYear,
            yearBodyId,
            monthBodyId,
            getYear,
            setYear,
            getMonth,
            setMonth,
            onAfterMonthSelected
        };

        this.renderYearMonthPanel(stateKey, initialView);
    }

    renderYearMonthPanel(stateKey, view = 'year') {
        const state = this[stateKey];
        if (!state || !state.container) return;
        const container = state.container;

        if (view === 'month') {
            const monthNames = this.getMonthNames();
            const y = state.getYear();
            container.innerHTML = `
                <div class="zhenshangyin-custom-navigation">
                    <button class="zhenshangyin-prev-year-yearmonthpanel" data-yearmonthpanel="${stateKey}">${this.getNavigationIcon('prev')}</button>
                    <span class="zhenshangyin-current-display zhenshangyin-yearmonthpanel-year-display">${y}${this.language === 'en' ? '' : '年'}</span>
                    <button class="zhenshangyin-next-year-yearmonthpanel" data-yearmonthpanel="${stateKey}">${this.getNavigationIcon('next')}</button>
                </div>
                <table><tbody id="${state.monthBodyId}">
                    <tr><td>${monthNames[0]}</td><td>${monthNames[1]}</td><td>${monthNames[2]}</td></tr>
                    <tr><td>${monthNames[3]}</td><td>${monthNames[4]}</td><td>${monthNames[5]}</td></tr>
                    <tr><td>${monthNames[6]}</td><td>${monthNames[7]}</td><td>${monthNames[8]}</td></tr>
                    <tr><td>${monthNames[9]}</td><td>${monthNames[10]}</td><td>${monthNames[11]}</td></tr>
                </tbody></table>
            `;

            const monthBody = container.querySelector(`#${state.monthBodyId}`);
            if (!monthBody) return;
            const currentMonthIndex = state.getMonth();
            this.buildMonthGrid(monthBody, (cell, monthIndex, monthNumber) => {
                cell.dataset.year = y;
                cell.dataset.month = monthNumber;
                if (this.isMonthDisabled(y, monthNumber)) {
                    cell.classList.add('zhenshangyin-custom-disabled');
                    return;
                }
                if (monthIndex === currentMonthIndex) {
                    cell.classList.add('zhenshangyin-custom-selected');
                }
            }, stateKey);
            return;
        }

        const startYear = Math.floor(state.baseYear / 10) * 10;
        const endYear = startYear + 9;
        const rangeText = `${startYear}${this.language === 'en' ? ' - ' : '年 - '}${endYear}${this.language === 'en' ? '' : '年'}`;
        container.innerHTML = `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-decade" data-yearmonthpanel="${stateKey}">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display zhenshangyin-date-decade-display">${rangeText}</span>
                <button class="zhenshangyin-next-decade" data-yearmonthpanel="${stateKey}">${this.getNavigationIcon('next-double')}</button>
            </div>
            <table><tbody id="${state.yearBodyId}"></tbody></table>
        `;

        const yearBody = container.querySelector(`#${state.yearBodyId}`);
        if (!yearBody) return;
        const selectedYear = state.getYear();
        this.buildYearGrid(yearBody, startYear, (cell, year) => {
            if (this.isYearDisabled(year)) {
                cell.classList.add('zhenshangyin-custom-disabled');
                return;
            }
            if (year === selectedYear) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        }, '', stateKey);
    }

    openYearPanel({
        stateKey,
        container,
        nav,
        baseYear,
        yearBodyId,
        getYear,
        setYear,
        onAfterYearSelected,
        removeSelectors = []
    }) {
        if (!this.picker || !container) return;

        if (this[stateKey]) {
            this.restoreYearMonthPanel(stateKey);
        }

        let navPlaceholder = null;
        if (nav && nav.parentNode) {
            navPlaceholder = document.createComment(`${stateKey}-nav-placeholder`);
            nav.parentNode.replaceChild(navPlaceholder, nav);
        }

        const removedPairs = [];
        removeSelectors.forEach(selector => {
            const nodes = Array.from(this.picker.querySelectorAll(selector));
            nodes.forEach((node, idx) => {
                if (!node || !node.parentNode) return;
                const placeholder = document.createComment(`${stateKey}-${selector}-placeholder-${idx}`);
                node.parentNode.replaceChild(placeholder, node);
                removedPairs.push({ node, placeholder });
            });
        });

        this[stateKey] = {
            panelType: 'yearOnly',
            container,
            originalHTML: container.innerHTML,
            nav,
            navPlaceholder,
            removedPairs,
            baseYear: typeof baseYear === 'number' ? baseYear : this.currentYear,
            yearBodyId,
            getYear,
            setYear,
            onAfterYearSelected
        };

        this.renderYearPanel(stateKey);
    }

    renderYearPanel(stateKey) {
        const state = this[stateKey];
        if (!state || !state.container) return;
        const container = state.container;

        const startYear = Math.floor(state.baseYear / 10) * 10;
        const endYear = startYear + 9;
        const rangeText = `${startYear}${this.language === 'en' ? ' - ' : '年 - '}${endYear}${this.language === 'en' ? '' : '年'}`;

        container.innerHTML = `
            <div class="zhenshangyin-custom-navigation">
                <button class="zhenshangyin-prev-decade" data-yearpanel="${stateKey}">${this.getNavigationIcon('prev-double')}</button>
                <span class="zhenshangyin-current-display zhenshangyin-date-decade-display">${rangeText}</span>
                <button class="zhenshangyin-next-decade" data-yearpanel="${stateKey}">${this.getNavigationIcon('next-double')}</button>
            </div>
            <table><tbody id="${state.yearBodyId}"></tbody></table>
        `;

        const yearBody = container.querySelector(`#${state.yearBodyId}`);
        if (!yearBody) return;
        const selectedYear = state.getYear();
        this.buildYearGrid(yearBody, startYear, (cell, year) => {
            if (this.isYearDisabled(year)) {
                cell.classList.add('zhenshangyin-custom-disabled');
                return;
            }
            if (year === selectedYear) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        }, '', stateKey);
    }

    restoreYearMonthPanel(stateKey) {
        const state = this[stateKey];
        if (!state) return;

        const { container, originalHTML, nav, navPlaceholder, removedPairs } = state;
        container.innerHTML = originalHTML;

        if (navPlaceholder && navPlaceholder.parentNode) {
            if (nav) navPlaceholder.parentNode.replaceChild(nav, navPlaceholder);
            else navPlaceholder.remove();
        }

        if (removedPairs && removedPairs.length) {
            removedPairs.forEach(({ node, placeholder }) => {
                if (!placeholder || !placeholder.parentNode) return;
                if (node) placeholder.parentNode.replaceChild(node, placeholder);
                else placeholder.remove();
            });
        }

        this[stateKey] = null;
        this.cachePickerDom();
    }

    restoreDatePanel() {
        if (!this._datePanelState) return;
        this.restoreYearMonthPanel('_datePanelState');
        this.populateCalendar();
    }

    openDateRangeYearMonthPanel(type) {
        if (!this.picker) return;
        const calendarBody = this.picker.querySelector(`#${type}-calendar-body`);
        const container = calendarBody ? calendarBody.closest('.zhenshangyin-table-container') : null;
        if (!container) return;
        const nav = this.picker
            .querySelector(`.zhenshangyin-custom-navigation .zhenshangyin-current-display[data-type="${type}"]`)
            ?.closest('.zhenshangyin-custom-navigation');

        this.openYearMonthPanel({
            stateKey: '_dateRangePanelState',
            container,
            nav,
            baseYear: type === 'start' ? this.startYear : this.endYear,
            yearBodyId: `${type}-date-year-picker-body`,
            monthBodyId: `${type}-date-month-picker-body`,
            getYear: () => (type === 'start' ? this.startYear : this.endYear),
            setYear: (y) => { if (type === 'start') this.startYear = y; else this.endYear = y; },
            getMonth: () => (type === 'start' ? this.startMonth : this.endMonth),
            setMonth: (m) => { if (type === 'start') this.startMonth = m; else this.endMonth = m; },
            onAfterMonthSelected: () => this.updateCalendar(type),
            initialView: 'year',
            removeSelectors: ['.zhenshangyin-button-container', '.zhenshangyin-time-picker']
        });
    }

    openDateRangeYearMonthPanelWithView(type, initialView = 'year') {
        if (!this.picker) return;
        const calendarBody = this.picker.querySelector(`#${type}-calendar-body`);
        const container = calendarBody ? calendarBody.closest('.zhenshangyin-table-container') : null;
        if (!container) return;
        const nav = this.picker
            .querySelector(`.zhenshangyin-custom-navigation .zhenshangyin-current-display[data-type="${type}"]`)
            ?.closest('.zhenshangyin-custom-navigation');

        this.openYearMonthPanel({
            stateKey: '_dateRangePanelState',
            container,
            nav,
            baseYear: type === 'start' ? this.startYear : this.endYear,
            yearBodyId: `${type}-date-year-picker-body`,
            monthBodyId: `${type}-date-month-picker-body`,
            getYear: () => (type === 'start' ? this.startYear : this.endYear),
            setYear: (y) => { if (type === 'start') this.startYear = y; else this.endYear = y; },
            getMonth: () => (type === 'start' ? this.startMonth : this.endMonth),
            setMonth: (m) => { if (type === 'start') this.startMonth = m; else this.endMonth = m; },
            onAfterMonthSelected: () => this.updateCalendar(type),
            initialView,
            removeSelectors: ['.zhenshangyin-button-container', '.zhenshangyin-time-picker']
        });
    }

    restoreDateRangePanel() {
        if (!this._dateRangePanelState) return;
        this.restoreYearMonthPanel('_dateRangePanelState');
        this.populateCalendar('start');
        this.populateCalendar('end');
        this.setupRangeHoverEvents();
        if (this.showTime) {
            this.setupRangeTimeDropdowns('start');
            this.setupRangeTimeDropdowns('end');
            this.updateRangeTimeLabels();
        }
    }

    buildYearGrid(yearBody, startYear, decorateCell, type = '', yearMonthPanelKey = '') {
        yearBody.innerHTML = '';
        for (let row = 0; row < 4; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 3; col++) {
                const year = startYear + row * 3 + col;
                const cell = document.createElement('td');
                cell.textContent = year;
                cell.dataset.year = year;
                cell.dataset.type = type;
                if (yearMonthPanelKey) cell.dataset.yearmonthpanel = yearMonthPanelKey;
                if (decorateCell) decorateCell(cell, year);
                tr.appendChild(cell);
            }
            yearBody.appendChild(tr);
        }
    }

    buildMonthGrid(monthBody, decorateCell, yearMonthPanelKey = '') {
        const cells = monthBody.querySelectorAll('td');
        cells.forEach((cell, index) => {
            const monthNumber = index + 1;
            cell.classList.remove('zhenshangyin-custom-selected', 'zhenshangyin-custom-disabled');
            if (yearMonthPanelKey) cell.dataset.yearmonthpanel = yearMonthPanelKey;
            if (decorateCell) decorateCell(cell, index, monthNumber);
        });
    }

    setupDateRangePickerEvents() {
        ['start', 'end'].forEach(type => {
            this.populateCalendar(type);
            if (this.showTime) this.setupRangeTimeDropdowns(type);
        });
        this.setupRangeHoverEvents();

        if (this.showTime) {
            this.updateRangeTimeLabels();
            this.dom && (this.dom.confirmBtn = this.picker.querySelector('.zhenshangyin-confirm-btn'));
        }
    }

    updateRangeTimeLabels() {
        if (!this.picker || this.type !== 'dateRange' || !this.showTime) return;
        const startEl = this.picker.querySelector('.zhenshangyin-date-label[data-type="start"]');
        const endEl = this.picker.querySelector('.zhenshangyin-date-label[data-type="end"]');
        if (startEl) startEl.textContent = this.formatDateOnlyForRange('start');
        if (endEl) endEl.textContent = this.formatDateOnlyForRange('end');
    }

    setupWeekPickerEvents() {
        this.populateWeekCalendar();
    }


    setupMonthPickerEvents() {
        this.populateMonths();
        if (this.multiSelect) {
            this.dom && (this.dom.confirmBtn = this.picker.querySelector('.zhenshangyin-confirm-btn'));
        }
    }

    setupMonthRangePickerEvents() {
        ['start', 'end'].forEach(type => {
            this.populateMonths(type);
        });
        this.setupMonthRangeHoverEvents();
        this.applyRangeStyles();
    }

    setupYearPickerEvents() {
        this.populateYears();
        if (this.multiSelect) {
            this.dom && (this.dom.confirmBtn = this.picker.querySelector('.zhenshangyin-confirm-btn'));
        }
    }

    setupYearRangePickerEvents() {
        ['start', 'end'].forEach(type => {
            this.populateYears(type);
        });
        this.setupYearRangeHoverEvents();
    }

    setupYearRangeHoverEvents() {
        return;
    }

    applyHoverYearRangeStyle(hoverYear) {
        this.picker.querySelectorAll('td[data-year]').forEach(cell => {
            if (cell.dataset.yearmonthpanel) return;
            const cellYear = parseInt(cell.dataset.year);
            cell.classList.remove('zhenshangyin-hover-range');
            if (this.startYear) {
                const [rangeStart, rangeEnd] = this.startYear < hoverYear ? [this.startYear, hoverYear] : [hoverYear, this.startYear];
                if (cellYear >= rangeStart && cellYear <= rangeEnd) {
                    cell.classList.add('zhenshangyin-hover-range');
                }
            }
        });
    }

    setupTimePickerEvents() {
        this.parseTimeInputValue();
        this.setupStandaloneTimeScrolls();
        this.setupStandaloneTimeButtons();
    }

    parseTimeInputValue() {
        if (this.isSeparate && this.type === 'timeRange') {
            const startStr = (this.startInput?.value || '').trim();
            const endStr = (this.endInput?.value || '').trim();
            if (startStr) this.assignTimeFromString(this.startTime, startStr);
            if (endStr) this.assignTimeFromString(this.endTime, endStr);
        } else {
            const value = (this.dateInput?.value || '').trim();
            if (!value) return;
            if (this.type === 'timeRange') {
                const [startStr = '', endStr = ''] = value.split(this.separator);
                if (startStr) this.assignTimeFromString(this.startTime, startStr);
                if (endStr) this.assignTimeFromString(this.endTime, endStr);
            } else {
                this.assignTimeFromString(this.selectedTime, value);
            }
        }
    }

    assignTimeFromString(target, str) {
        const parts = str.split(':').map(s => parseInt(s, 10));
        target.hours = isNaN(parts[0]) ? 0 : parts[0];
        target.minutes = isNaN(parts[1]) ? 0 : parts[1];
        target.seconds = isNaN(parts[2]) ? 0 : parts[2];
    }

    createStandaloneTimePickerHTML() {
        if (this.type === 'timeRange') {
            return `
            <div class="zhenshangyin-date-range-container">
                <div class="zhenshangyin-time-picker-wrapper">${this.createStandaloneTimeContent('start')}</div>
                <div class="zhenshangyin-time-picker-wrapper">${this.createStandaloneTimeContent('end')}</div>
            </div>
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-confirm-btn">${this.language === 'en' ? 'Confirm' : '确认'}</button>
            </div>`;
        }
        return this.createStandaloneTimeContent('single');
    }

    createStandaloneTimeContent(type) {
        const time = type === 'start' ? this.startTime : (type === 'end' ? this.endTime : this.selectedTime);
        const showHours = this.showHours;
        const showMinutes = this.showMinutes;
        const showSeconds = this.showSeconds;
        const nowText = this.language === 'en' ? 'Now' : '此刻';
        const confirmText = this.language === 'en' ? 'Confirm' : '确认';

        const placeholder = () => Array.from({ length: 2 }, () => `<div class="zhenshangyin-scroll-item placeholder"></div>`).join('');
        const buildItems = (values, selected) => values.map(v => `<div class="zhenshangyin-scroll-item${v === selected ? ' selected' : ''}">${String(v).padStart(2, '0')}</div>`).join('');
        const col = (id, values, selected) => `
            <div class="zhenshangyin-time-scroll" id="${id}">
                <div class="zhenshangyin-time-scroll-content">
                    ${placeholder()}
                    ${buildItems(values, selected)}
                    ${placeholder()}
                </div>
            </div>`;

        return `
            <div class="zhenshangyin-time-scroll-container">
                ${showHours ? col(`${type}-hours-scroll`, this.availableHours, time.hours) : ''}
                ${showMinutes ? col(`${type}-minutes-scroll`, this.availableMinutes, time.minutes) : ''}
                ${showSeconds ? col(`${type}-seconds-scroll`, this.availableSeconds, time.seconds) : ''}
            </div>
            ${this.type !== 'timeRange' ? `
            <div class="zhenshangyin-button-container">
                <button class="zhenshangyin-current-time-btn zhenshangyin-itm-current-time-btn">${nowText}</button>
                <button class="zhenshangyin-confirm-btn">${confirmText}</button>
            </div>` : ''}
        `;
    }

    setupStandaloneTimeScrolls() {
        if (this.type === 'timeRange') {
            ['start', 'end'].forEach(type => this.setupStandaloneTimeScroll(type));
        } else {
            this.setupStandaloneTimeScroll('single');
        }
    }

    setupStandaloneTimeScroll(type) {
        if (this.showHours) this.setupStandaloneScroll(`${type}-hours-scroll`, 'hours', type, 24);
        if (this.showMinutes) this.setupStandaloneScroll(`${type}-minutes-scroll`, 'minutes', type, 60);
        if (this.showSeconds) this.setupStandaloneScroll(`${type}-seconds-scroll`, 'seconds', type, 60);
    }

    setupStandaloneScroll(scrollId, timeUnit, type, maxValue) {
        const scrollElement = this.picker.querySelector(`#${scrollId}`);
        if (!scrollElement) return;
        const contentElement = this.getScrollContentElement(scrollElement);
        const items = contentElement.querySelectorAll('.zhenshangyin-scroll-item:not(.placeholder)');
        const time = type === 'start' ? this.startTime : (type === 'end' ? this.endTime : this.selectedTime);
        const values = timeUnit === 'hours' ? this.availableHours : (timeUnit === 'minutes' ? this.availableMinutes : this.availableSeconds);
        const initialIndex = Math.max(0, values.indexOf(time[timeUnit]));
        this.standaloneCenterScroll(scrollElement, initialIndex);
        
        setTimeout(() => {
            this.createCustomScrollbar(scrollElement);
        }, 0);
        
        let scrollTimeout;
        contentElement.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const index = this.getStandaloneIndexFromScroll(scrollElement, items.length);
                if (index >= 0 && index < items.length) {
                    const t = type === 'start' ? this.startTime : (type === 'end' ? this.endTime : this.selectedTime);
                    t[timeUnit] = values[index] ?? index;
                    items.forEach((it, i) => it.classList.toggle('selected', i === index));
                    this.standaloneCenterScroll(scrollElement, index);
                }
            }, 100);
        });
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                const t = type === 'start' ? this.startTime : (type === 'end' ? this.endTime : this.selectedTime);
                t[timeUnit] = values[index] ?? index;
                this.standaloneCenterScroll(scrollElement, index);
                items.forEach((it, i) => it.classList.toggle('selected', i === index));
            });
        });
    }

    getScrollContentElement(scrollElement) {
        return scrollElement.querySelector('.zhenshangyin-time-scroll-content') || scrollElement;
    }

    getStandaloneScrollMetrics(scrollElement) {
        const contentElement = this.getScrollContentElement(scrollElement);
        const firstItem = contentElement.querySelector('.zhenshangyin-scroll-item:not(.placeholder)');
        const itemHeight = firstItem ? firstItem.offsetHeight : 30;
        const visibleCenter = scrollElement.clientHeight / 2;
        const topPlaceholderCount = 2;
        const topPadding = topPlaceholderCount * itemHeight;
        return { itemHeight, visibleCenter, topPadding, contentElement };
    }

    standaloneCenterScroll(scrollElement, index) {
        const { itemHeight, visibleCenter, topPadding, contentElement } = this.getStandaloneScrollMetrics(scrollElement);
        const targetScrollTop = topPadding + index * itemHeight - (visibleCenter - itemHeight / 2);
        contentElement.scrollTop = Math.max(0, Math.round(targetScrollTop));
    }

    getStandaloneIndexFromScroll(scrollElement, maxValue) {
        const { itemHeight, visibleCenter, topPadding, contentElement } = this.getStandaloneScrollMetrics(scrollElement);
        const raw = (contentElement.scrollTop + visibleCenter - itemHeight / 2 - topPadding) / itemHeight;
        const index = Math.round(raw);
        return Math.min(Math.max(index, 0), maxValue - 1);
    }

    createCustomScrollbar(scrollElement) {
        const existingTrack = scrollElement.querySelector('.zhenshangyin-custom-scrollbar-track');
        if (existingTrack) {
            existingTrack.remove();
        }

        if (scrollElement._customScrollbarCleanup) {
            scrollElement._customScrollbarCleanup();
            scrollElement._customScrollbarCleanup = null;
        }

        const contentElement = this.getScrollContentElement(scrollElement);

        const track = document.createElement('div');
        track.className = 'zhenshangyin-custom-scrollbar-track';
        
        const thumb = document.createElement('div');
        thumb.className = 'zhenshangyin-custom-scrollbar-thumb';
        track.appendChild(thumb);
        
        scrollElement.appendChild(track);
        
        this.updateCustomScrollbar(scrollElement);
        
        let scrollTimeout;
        const updateScrollbar = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateCustomScrollbar(scrollElement);
            }, 10);
        };
        
        contentElement.addEventListener('scroll', updateScrollbar);
        
        let isDragging = false;
        let startY = 0;
        let startScrollTop = 0;
        
        const handleMouseDown = (e) => {
            isDragging = true;
            startY = e.clientY;
            startScrollTop = contentElement.scrollTop;
            thumb.classList.add('dragging');
            e.preventDefault();
        };
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaY = e.clientY - startY;
            const trackHeight = scrollElement.clientHeight - 10;
            const scrollHeight = contentElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight);
            const maxThumbMove = trackHeight - thumbHeight;
            
            if (maxThumbMove > 0 && maxScroll > 0) {
                const scrollRatio = maxScroll / maxThumbMove;
                const scrollDelta = deltaY * scrollRatio;
                contentElement.scrollTop = Math.max(0, Math.min(startScrollTop + scrollDelta, maxScroll));
            }
        };
        
        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                thumb.classList.remove('dragging');
            }
        };
        
        thumb.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        track.addEventListener('click', (e) => {
            if (e.target === thumb) return;
            const rect = track.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const trackHeight = scrollElement.clientHeight - 10;
            const scrollHeight = contentElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;
            const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight);
            const maxThumbMove = trackHeight - thumbHeight;
            const maxScroll = scrollHeight - clientHeight;
            
            if (maxThumbMove > 0 && maxScroll > 0) {
                const clickRatio = Math.max(0, Math.min(1, (clickY - thumbHeight / 2) / maxThumbMove));
                contentElement.scrollTop = clickRatio * maxScroll;
            }
        });
        
        scrollElement._customScrollbarCleanup = () => {
            contentElement.removeEventListener('scroll', updateScrollbar);
            thumb.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        if (!this._customScrollbarElements) this._customScrollbarElements = new Set();
        this._customScrollbarElements.add(scrollElement);
    }
    
    updateCustomScrollbar(scrollElement) {
        const track = scrollElement.querySelector('.zhenshangyin-custom-scrollbar-track');
        if (!track) return;
        
        const thumb = track.querySelector('.zhenshangyin-custom-scrollbar-thumb');
        if (!thumb) return;
        
        const contentElement = this.getScrollContentElement(scrollElement);
        const scrollHeight = contentElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;
        const scrollTop = contentElement.scrollTop;
        
        if (scrollHeight <= clientHeight) {
            track.style.display = 'none';
            return;
        }
        
        track.style.display = 'block';
        
        const trackHeight = clientHeight - 10;
        
        const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight);
        thumb.style.height = thumbHeight + 'px';
        
        const maxScrollTop = scrollHeight - clientHeight;
        const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * (trackHeight - thumbHeight) : 0;
        thumb.style.top = thumbTop + 'px';
    }

    setupStandaloneTimeButtons() {
        if (this.type !== 'timeRange') {
            const nowBtn = this.picker.querySelector('.zhenshangyin-current-time-btn');
            if (nowBtn) {
                if (!this._onStandaloneNowBtnClick) {
                    this._onStandaloneNowBtnClick = () => {
                        const now = new Date();
                        this.selectedTime.hours = now.getHours();
                        this.selectedTime.minutes = now.getMinutes();
                        this.selectedTime.seconds = now.getSeconds();
                        if (this.showHours) {
                            const idx = Math.max(0, this.availableHours.indexOf(this.selectedTime.hours));
                            this.standaloneCenterScroll(this.picker.querySelector('#single-hours-scroll'), idx);
                        }
                        if (this.showMinutes) {
                            const idx = Math.max(0, this.availableMinutes.indexOf(this.selectedTime.minutes));
                            this.standaloneCenterScroll(this.picker.querySelector('#single-minutes-scroll'), idx);
                        }
                        if (this.showSeconds) {
                            const idx = Math.max(0, this.availableSeconds.indexOf(this.selectedTime.seconds));
                            this.standaloneCenterScroll(this.picker.querySelector('#single-seconds-scroll'), idx);
                        }
                        this.updateStandaloneTimeInputs();
                        this.closePicker();
                    };
                }
                if (!this._standaloneNowBtnBound) {
                    nowBtn.addEventListener('click', this._onStandaloneNowBtnClick);
                    this._standaloneNowBtnBound = true;
                }
            }
        }
    }

    formatTimeObject(time) {
        let result = this.dateFormat;
        if (this.showHours) result = result.replace('HH', String(time.hours).padStart(2, '0'));
        if (this.showMinutes) result = result.replace('mm', String(time.minutes).padStart(2, '0'));
        if (this.showSeconds) result = result.replace('ss', String(time.seconds).padStart(2, '0'));
        return result;
    }

    updateStandaloneTimeInputs() {
        if (this.type === 'timeRange') {
            const startStr = this.formatTimeObject(this.startTime);
            const endStr = this.formatTimeObject(this.endTime);
            if (this.isSeparate && this.startInput && this.endInput) {
                this.startInput.value = startStr;
                this.endInput.value = endStr;
            } else if (this.dateInput) {
                this.dateInput.value = `${startStr}${this.separator}${endStr}`;
            }
            this.onSelect(this.isSeparate ? [startStr, endStr] : `${startStr}${this.separator}${endStr}`);
        } else {
            const str = this.formatTimeObject(this.selectedTime);
            if (this.dateInput) this.dateInput.value = str;
            this.onSelect(str);
        }
    }

    populateCalendar(type = '') {
        const bodyId = type ? `${type}-calendar-body` : 'calendar-body';
        const calendarBody = this.getPickerBodyById(bodyId);
        const year = type === 'start' ? this.startYear : type === 'end' ? this.endYear : this.currentYear;
        const month = type === 'start' ? this.startMonth : type === 'end' ? this.endMonth : this.currentMonth;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        calendarBody.innerHTML = '';

        for (let week = 0; week < 6; week++) {
            const row = document.createElement('tr');
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + week * 7 + day);

                const cell = document.createElement('td');
                cell.textContent = currentDate.getDate();
                cell.dataset.date = this.getDateKey(currentDate);
                cell.dataset.type = type;

                if (currentDate.getMonth() !== month) {
                    cell.style.opacity = '0.5';
                    cell.classList.add('zhenshangyin-custom-other-month');
                }

                if (this.isDateDisabled(currentDate)) {
                    cell.classList.add('zhenshangyin-custom-disabled');
                }

                this.applyDateStyles(cell, currentDate, type);
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
    }

    populateWeekCalendar(type = '') {
        const bodyId = type ? `${type}-week-calendar-body` : 'week-calendar-body';
        const calendarBody = this.getPickerBodyById(bodyId);
        const year = type === 'start' ? this.startYear : type === 'end' ? this.endYear : this.currentYear;
        const month = type === 'start' ? this.startMonth : type === 'end' ? this.endMonth : this.currentMonth;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        calendarBody.innerHTML = '';

        for (let week = 0; week < 6; week++) {
            const row = document.createElement('tr');
            const weekDates = [];
            row.dataset.weekRow = '1';
            row.dataset.type = type;

            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + week * 7 + day);
                weekDates.push(new Date(currentDate));

                const cell = document.createElement('td');
                cell.textContent = currentDate.getDate();
                cell.dataset.date = this.getDateKey(currentDate);

                if (currentDate.getMonth() !== month) {
                    cell.style.opacity = '0.5';
                    cell.classList.add('zhenshangyin-custom-other-month');
                }

                row.appendChild(cell);
            }

            this.applyWeekStyles(row, weekDates, type);
            calendarBody.appendChild(row);
        }
    }

    populateMonths(type = '') {
        const bodyId = type ? `${type}-month-picker-body` : 'month-picker-body';
        const monthBody = this.getPickerBodyById(bodyId);
        const year = type === 'start' ? this.currentYear : type === 'end' ? this.endYear : this.currentYear;

        const monthCells = monthBody.querySelectorAll('td');
        monthCells.forEach((cell, index) => {
            const month = index + 1;
            cell.classList.remove('zhenshangyin-custom-selected', 'zhenshangyin-selected-range', 'zhenshangyin-hover-range', 'zhenshangyin-custom-disabled');

            cell.dataset.year = year;
            cell.dataset.month = month;
            cell.dataset.type = type;

            if (this.isMonthDisabled(year, month)) {
                cell.classList.add('zhenshangyin-custom-disabled');
            }

            this.applyMonthStyles(cell, year, month, type);
        });
    }

    populateYears(type = '') {
        const bodyId = type ? `${type}-year-picker-body` : 'year-picker-body';
        const yearBody = this.getPickerBodyById(bodyId);
        let baseYear = this.currentYear;
        if (this.type === 'yearRange') {
            if (type === 'start') baseYear = this.startPanelYear;
            else if (type === 'end') baseYear = this.endPanelYear;
        }
        let startYear;
        if (this.type === 'yearRange' && type === 'end') {
            startYear = baseYear;
        } else {
            startYear = Math.floor(baseYear / 10) * 10;
        }

        yearBody.innerHTML = '';

        for (let row = 0; row < 4; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 3; col++) {
                const year = startYear + row * 3 + col;
                const cell = document.createElement('td');
                cell.textContent = year;
                cell.dataset.year = year;
                cell.dataset.type = type;

                if (this.isYearDisabled(year)) {
                    cell.classList.add('zhenshangyin-custom-disabled');
                }

                this.applyYearStyles(cell, year, type);
                tr.appendChild(cell);
            }
            yearBody.appendChild(tr);
        }
    }

    selectDate(date, type = '') {
        if (this.type === 'date') {
            if (this.multiSelect) {
                const dateStr = this.formatDate(date);
                if (this.selectedDates.has(dateStr)) {
                    this.selectedDates.delete(dateStr);
                } else {
                    this.selectedDates.add(dateStr);
                }
                this.updateInputValue();
                this.populateCalendar();
            } else {
                this.selectedDate = date;
                this.currentYear = date.getFullYear();
                this.currentMonth = date.getMonth();

                this.updateInputValue();

                if (this.picker) {
                    this.populateCalendar();
                }

                if (!this.showTime) {
                    this.closePicker();
                }
            }
        } else if (this.type === 'dateRange') {
            this.selectRangeValue(this.normalizeDate(date), {
                startKey: 'startDate',
                endKey: 'endDate',
                onStart: () => { if (this.showTime) this.updateRangeTimeLabels(); },
                onComplete: () => { if (this.showTime) this.updateRangeTimeLabels(); },
                onReset: () => { if (this.showTime) this.updateRangeTimeLabels(); }
            });
            this.applyRangeStyles();
        }
    }

    selectRangeValue(value, { startKey, endKey, onStart, onComplete, onReset } = {}) {
        if (!startKey || !endKey) return;

        const setStart = () => {
            this[startKey] = value;
            this[endKey] = null;
        };

        const complete = () => {
            this[endKey] = value;
            if (this[startKey] > this[endKey]) {
                [this[startKey], this[endKey]] = [this[endKey], this[startKey]];
            }
            if (!this.showTime) {
                this.updateInputValue();
                this.closePicker();
            }
        };

        if (this.isSeparate) {
            if (!this[startKey]) {
                setStart();
                this.isSelectingStart = false;
                if (typeof onStart === 'function') onStart();
                return;
            }
            if (!this[endKey]) {
                complete();
                if (typeof onComplete === 'function') onComplete();
                return;
            }
            setStart();
            this.isSelectingStart = false;
            if (typeof onReset === 'function') onReset();
            return;
        }

        if (this.isSelectingStart) {
            setStart();
            this.isSelectingStart = false;
            if (typeof onStart === 'function') onStart();
            return;
        }

        complete();
        this.isSelectingStart = true;
        if (typeof onComplete === 'function') onComplete();
    }

    selectWeek(weekDates, type = '') {
        this.selectedWeek = { start: weekDates[0], end: weekDates[6] };
        this.updateInputValue();
        this.closePicker();
    }

    selectMonth(year, month, type = '') {
        if (this.type === 'month') {
            if (this.multiSelect) {
                const existingIndex = this.selectedMonths.findIndex(m => m.year === year && m.month === month);
                if (existingIndex > -1) {
                    this.selectedMonths.splice(existingIndex, 1);
                } else {
                    this.selectedMonths.push({ year, month });
                }
                this.updateInputValue();
                this.currentYear = year;
                this.updateCalendar();
            } else {
                this.selectedMonths = [{ year, month }];
                this.updateInputValue();
                this.closePicker();
            }
        } else if (this.type === 'monthRange') {
            const selectedMonth = new Date(year, month - 1, 1);
            this.selectRangeValue(selectedMonth, {
                startKey: 'startMonth',
                endKey: 'endMonth'
            });
            this.applyRangeStyles();
        }
    }

    selectYear(year, type = '') {
        if (this.type === 'year') {
            if (this.multiSelect) {
                const existingIndex = this.selectedYears.indexOf(year);
                if (existingIndex > -1) {
                    this.selectedYears.splice(existingIndex, 1);
                } else {
                    this.selectedYears.push(year);
                }
                this.updateInputValue();
                this.populateYears();
            } else {
                this.selectedYears = [year];
                this.updateInputValue();
                this.closePicker();
            }
        } else if (this.type === 'yearRange') {
            this.selectRangeValue(year, {
                startKey: 'startYear',
                endKey: 'endYear'
            });
            this.applyRangeStyles();
        }
    }

    setupTimeDropdowns() {
        const dropdown = this.picker.querySelector('#zhenshangyin-time-dropdown');
        if (!dropdown) return;

        const scrollContainer = dropdown.querySelector('.zhenshangyin-scroll-container');
        const confirm = scrollContainer.querySelector('.zhenshangyin-confirm-confirm');

        if (confirm) {
            confirm.dataset.confirmconfirm = '1';
        }

        if (!this._onDocClickDropdown) {
            this._onDocClickDropdown = (event) => {
                if (!dropdown.contains(event.target)) {
                    scrollContainer.style.display = 'none';
                }
            };
            document.addEventListener('click', this._onDocClickDropdown);
        }

        if (this.showHours) {
            const hoursScroll = scrollContainer.querySelector('#hours-scroll');
            this.setupScroll(hoursScroll, 'hours');
        }
        if (this.showMinutes) {
            const minutesScroll = scrollContainer.querySelector('#minutes-scroll');
            this.setupScroll(minutesScroll, 'minutes');
        }
        if (this.showSeconds) {
            const secondsScroll = scrollContainer.querySelector('#seconds-scroll');
            this.setupScroll(secondsScroll, 'seconds');
        }

        const currentTimeBtn = this.picker.querySelector('.zhenshangyin-current-time-btn');
        if (currentTimeBtn) {
            if (!this._onCurrentTimeBtnClick) {
                this._onCurrentTimeBtnClick = () => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const currentSecond = now.getSeconds();

                    const closestHour = this.availableHours.reduce((prev, curr) =>
                        Math.abs(curr - currentHour) < Math.abs(prev - currentHour) ? curr : prev
                    );

                    const closestMinute = this.availableMinutes.reduce((prev, curr) =>
                        Math.abs(curr - currentMinute) < Math.abs(prev - currentMinute) ? curr : prev
                    );

                    const closestSecond = this.availableSeconds.reduce((prev, curr) =>
                        Math.abs(curr - currentSecond) < Math.abs(prev - currentSecond) ? curr : prev
                    );

                    this.selectedTime.hours = closestHour;
                    this.selectedTime.minutes = closestMinute;
                    this.selectedTime.seconds = closestSecond;
                    this.selectedDate = now;
                    this.currentYear = now.getFullYear();
                    this.currentMonth = now.getMonth();
                    this.updateCalendar();
                    const dateObj = new Date(this.currentYear, this.currentMonth, now.getDate());
                    const formattedDate = this.formatDateWithTime(dateObj, this.showTime ? this.selectedTime : null);
                    if (this.dateInput) this.dateInput.value = formattedDate;
                    dropdown.querySelector('.zhenshangyin-dropdown-label').textContent = this.formatTime();
                };
            }
            if (!this._currentTimeBtnBound) {
                currentTimeBtn.addEventListener('click', this._onCurrentTimeBtnClick);
                this._currentTimeBtnBound = true;
            }
        }
    }

    setupRangeTimeDropdowns(type) {
        const dropdown = this.picker.querySelector(`#${type}-zhenshangyin-time-dropdown`);
        if (!dropdown) return;
        const scrollContainer = dropdown.querySelector('.zhenshangyin-scroll-container');
        const dropdownLabel = dropdown.querySelector('.zhenshangyin-dropdown-label');
        const hoursScroll = scrollContainer.querySelector(`#${type}-hours-scroll`);
        const minutesScroll = scrollContainer.querySelector(`#${type}-minutes-scroll`);
        const secondsScroll = scrollContainer.querySelector(`#${type}-seconds-scroll`);
        const confirm = scrollContainer.querySelector('.zhenshangyin-confirm-confirm');

        const attach = (el, unit, values) => {
            if (!el) return;
            const contentElement = this.getScrollContentElement(el);

            if (el._timeScrollCleanup) return;

            setTimeout(() => {
                this.createCustomScrollbar(el);
            }, 0);
            
            let timer;
            const onScroll = () => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    const first = contentElement.querySelector('.zhenshangyin-scroll-item:not(.placeholder)');
                    const itemHeight = first ? first.offsetHeight : 30;
                    const visibleCenter = el.clientHeight / 2;
                    const topPadding = 2 * itemHeight;
                    const raw = (contentElement.scrollTop + visibleCenter - itemHeight / 2 - topPadding) / itemHeight;
                    const idx = Math.round(raw);
                    const t = type === 'start' ? this.startTime : this.endTime;
                    t[unit] = (values && values[idx] !== undefined) ? values[idx] : idx;
                    this.updateDropdownSelected(el, idx);
                    dropdown.querySelector('.zhenshangyin-dropdown-label').textContent = this.formatTime(t);
                    contentElement.scrollTop = Math.max(0, Math.round(topPadding + idx * itemHeight - (visibleCenter - itemHeight / 2)));
                }, 100);
            };

            contentElement.addEventListener('scroll', onScroll);
            el._timeScrollCleanup = () => {
                contentElement.removeEventListener('scroll', onScroll);
                el._timeScrollCleanup = null;
            };
            if (!this._timeScrollElements) this._timeScrollElements = new Set();
            this._timeScrollElements.add(el);
        };

        attach(hoursScroll, 'hours', this.availableHours);
        attach(minutesScroll, 'minutes', this.availableMinutes);
        attach(secondsScroll, 'seconds', this.availableSeconds);

        if (confirm) {
            confirm.dataset.confirmconfirm = '1';
        }

        const fieldName = type === 'start' ? '_onDocClickDropdownStart' : '_onDocClickDropdownEnd';
        if (!this[fieldName]) {
            this[fieldName] = (event) => {
                if (!dropdown.contains(event.target)) {
                    scrollContainer.style.display = 'none';
                }
            };
            document.addEventListener('click', this[fieldName]);
        }
    }



    setupScroll(scrollElement, timeUnit) {
        if (!scrollElement) return;
        if (scrollElement._timeScrollCleanup) return;
        const contentElement = this.getScrollContentElement(scrollElement);
        let scrollTimeout;

        const timeArray = timeUnit === 'hours' ? this.availableHours :
            timeUnit === 'minutes' ? this.availableMinutes :
                this.availableSeconds;

        setTimeout(() => {
            this.createCustomScrollbar(scrollElement);
        }, 0);

        const onScroll = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const index = this.getDropdownIndexFromScroll(scrollElement, timeArray.length);
                if (index >= 0 && index < timeArray.length) {
                    this.selectedTime[timeUnit] = timeArray[index];
                    this.updateDropdownSelected(scrollElement, index);
                    this.picker.querySelector('.zhenshangyin-dropdown-label').textContent = this.formatTime();
                    this.dropdownCenterScroll(scrollElement, index);
                }
            }, 100);
        };

        contentElement.addEventListener('scroll', onScroll);
        scrollElement._timeScrollCleanup = () => {
            contentElement.removeEventListener('scroll', onScroll);
            scrollElement._timeScrollCleanup = null;
        };
        if (!this._timeScrollElements) this._timeScrollElements = new Set();
        this._timeScrollElements.add(scrollElement);
    }

    cleanupTimeScrollListeners() {
        if (!this._timeScrollElements || !this._timeScrollElements.size) return;
        this._timeScrollElements.forEach(el => {
            if (!el) return;
            if (el._timeScrollCleanup) {
                el._timeScrollCleanup();
            }
        });
        this._timeScrollElements.clear();
    }

    updateDropdownSelected(scrollElement, idx) {
        if (!scrollElement) return;
        const contentElement = this.getScrollContentElement(scrollElement);
        const items = contentElement.querySelectorAll('.zhenshangyin-scroll-item:not(.placeholder)');
        items.forEach((it, i) => it.classList.toggle('selected', i === idx));
    }

    getTimeScrollContextFromElement(scrollElement) {
        if (!scrollElement) return null;
        const id = scrollElement.id || '';
        const unit = id.includes('hours-scroll') ? 'hours' : (id.includes('minutes-scroll') ? 'minutes' : (id.includes('seconds-scroll') ? 'seconds' : ''));
        if (!unit) return null;
        const rangeType = id.startsWith('start-') ? 'start' : (id.startsWith('end-') ? 'end' : '');
        const time = rangeType === 'start' ? this.startTime : (rangeType === 'end' ? this.endTime : this.selectedTime);
        return { unit, rangeType, time };
    }

    getDropdownScrollMetrics(scrollElement) {
        const contentElement = this.getScrollContentElement(scrollElement);
        const firstItem = contentElement.querySelector('.zhenshangyin-scroll-item:not(.placeholder)');
        const itemHeight = firstItem ? firstItem.offsetHeight : 30;
        const visibleCenter = scrollElement.clientHeight / 2;
        const topPlaceholderCount = 2;
        const topPadding = topPlaceholderCount * itemHeight;
        return { itemHeight, visibleCenter, topPadding, contentElement };
    }

    dropdownCenterScroll(scrollElement, valueIndex) {
        const { itemHeight, visibleCenter, topPadding, contentElement } = this.getDropdownScrollMetrics(scrollElement);
        const targetScrollTop = topPadding + valueIndex * itemHeight - (visibleCenter - itemHeight / 2);
        contentElement.scrollTop = Math.max(0, Math.round(targetScrollTop));
    }

    getDropdownIndexFromScroll(scrollElement, maxLen) {
        const { itemHeight, visibleCenter, topPadding, contentElement } = this.getDropdownScrollMetrics(scrollElement);
        const raw = (contentElement.scrollTop + visibleCenter - itemHeight / 2 - topPadding) / itemHeight;
        const index = Math.round(raw);
        return Math.min(Math.max(index, 0), maxLen - 1);
    }

    changeYear(direction, type = '') {
        if (this.type === 'monthRange') {
            if (type === 'start') {
                this.currentYear += direction;
            } else if (type === 'end') {
                this.endYear += direction;
            } else {
                this.currentYear += direction;
            }
        } else {
            if (type === 'start') {
                this.startYear += direction;
            } else if (type === 'end') {
                this.endYear += direction;
            } else {
                this.currentYear += direction;
            }
        }
        this.updateCalendar(type);
    }

    changeMonth(direction, type = '') {
        if (type === 'start') {
            this.startMonth += direction;
            if (this.startMonth < 0) {
                this.startMonth = 11;
                this.startYear--;
            } else if (this.startMonth > 11) {
                this.startMonth = 0;
                this.startYear++;
            }
        } else if (type === 'end') {
            this.endMonth += direction;
            if (this.endMonth < 0) {
                this.endMonth = 11;
                this.endYear--;
            } else if (this.endMonth > 11) {
                this.endMonth = 0;
                this.endYear++;
            }
        } else {
            this.currentMonth += direction;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            } else if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
        }
        this.updateCalendar(type);
    }

    changeDecade(direction, type = '') {
        if (this.type === 'yearRange') {
            if (type === 'start') this.startPanelYear += direction;
            else if (type === 'end') this.endPanelYear += direction;
            else this.currentYear += direction;
        } else {
            this.currentYear += direction;
        }
        this.updateCalendar(type);
    }

    updateCalendar(type = '') {
        let display = this.dom ? (type === 'start' ? this.dom.startDisplay : (type === 'end' ? this.dom.endDisplay : this.dom.display)) : null;
        if (display && !display.isConnected) display = null;

        if (this.type === 'date' || this.type === 'dateRange' || this.type === 'week' || this.type === 'weekRange') {
            const year = type === 'start' ? this.startYear : type === 'end' ? this.endYear : this.currentYear;
            const month = type === 'start' ? this.startMonth : type === 'end' ? this.endMonth : this.currentMonth;

            let yearEl = this.dom ? (type === 'start' ? this.dom.startYearEl : (type === 'end' ? this.dom.endYearEl : this.dom.yearEl)) : null;
            let monthEl = this.dom ? (type === 'start' ? this.dom.startMonthEl : (type === 'end' ? this.dom.endMonthEl : this.dom.monthEl)) : null;
            if (yearEl && !yearEl.isConnected) yearEl = null;
            if (monthEl && !monthEl.isConnected) monthEl = null;

            if (!display || (!yearEl && !monthEl)) {
                const displaySelector = type ? `.zhenshangyin-current-display[data-type="${type}"]` : '.zhenshangyin-current-display';
                display = this.picker.querySelector(displaySelector);
                const yearSelector = type ? `.zhenshangyin-current-year[data-type="${type}"]` : '.zhenshangyin-current-year';
                const monthSelector = type ? `.zhenshangyin-current-month[data-type="${type}"]` : '.zhenshangyin-current-month';
                yearEl = this.picker.querySelector(yearSelector);
                monthEl = this.picker.querySelector(monthSelector);
            }

            if (yearEl && monthEl) {
                yearEl.textContent = `${year}${this.language === 'en' ? ' Year' : '年'}`;
                monthEl.textContent = `${month + 1}${this.language === 'en' ? ' Month' : '月'}`;
            } else if (display) {
                display.textContent = `${year}${this.language === 'en' ? ' Year ' : '年 '}${month + 1}${this.language === 'en' ? ' Month' : '月'}`;
            }

            if (this.type === 'date' || this.type === 'week') {
                this.type === 'date' ? this.populateCalendar() : this.populateWeekCalendar();
            } else {
                this.type === 'dateRange' ? this.populateCalendar(type) : this.populateWeekCalendar(type);
            }
        } else if (this.type === 'month' || this.type === 'monthRange') {
            const year = type === 'start' ? this.currentYear : type === 'end' ? this.endYear : this.currentYear;
            if (display) {
                display.textContent = `${year}${this.language === 'en' ? ' Year' : '年'}`;
            }
            this.type === 'month' ? this.populateMonths() : this.populateMonths(type);
        } else if (this.type === 'year' || this.type === 'yearRange') {
            if (display) {
                display.textContent = this.type === 'yearRange' ? this.getDecadeRange(type) : this.getDecadeRange();
            }
            this.type === 'year' ? this.populateYears() : this.populateYears(type);
        }

        if (this.type === 'dateRange') {
            this.setupRangeHoverEvents();
        } else if (this.type === 'monthRange') {
            this.setupMonthRangeHoverEvents();
        } else if (this.type === 'yearRange') {
            this.setupYearRangeHoverEvents();
        }

        if (this.isRangeType()) {
            this.applyRangeStyles();
        }
    }

    applyInitialStyles() {
        if (this.isRangeType() && this.hasSelectedRange()) {
            this.applyRangeStyles();
        }
    }

    hasSelectedRange() {
        if (this.type === 'dateRange') return this.startDate && this.endDate;
        if (this.type === 'monthRange') return this.startMonth && this.endMonth;
        if (this.type === 'yearRange') return this.startYear && this.endYear;
        if (this.type === 'weekRange') return this.startDate && this.endDate;
        return false;
    }

    applyDateStyles(cell, date, type = '') {
        if (this.type === 'date') {
            if (this.multiSelect && this.selectedDates.has(this.formatDate(date))) {
                cell.classList.add('zhenshangyin-custom-selected');
            } else if (!this.multiSelect && this.selectedDate && this.isSameDate(date, this.selectedDate)) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        }
    }

    applyWeekStyles(row, weekDates, type = '') {
        if (this.type === 'week' && this.selectedWeek) {
            if (this.isSameWeek(weekDates[0], this.selectedWeek.start)) {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('zhenshangyin-selected-range');
                    cell.classList.add('zhenshangyin-custom-selected');
                });
            }
        }
    }

    applyMonthStyles(cell, year, month, type = '') {
        if (this.type === 'month') {
            if (this.multiSelect) {
                if (this.selectedMonths.some(m => m.year === year && m.month === month)) {
                    cell.classList.add('zhenshangyin-custom-selected');
                }
            } else if (this.selectedMonths.length === 1 && this.selectedMonths[0].year === year && this.selectedMonths[0].month === month) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        } else if (this.type === 'monthRange') {
            const cellMonth = new Date(year, month - 1, 1);

            if (this.startMonth && this.endMonth) {
                if (cellMonth >= this.startMonth && cellMonth <= this.endMonth) {
                    cell.classList.add('zhenshangyin-selected-range');
                    if (cellMonth.getTime() === this.startMonth.getTime() || cellMonth.getTime() === this.endMonth.getTime()) {
                        cell.classList.add('zhenshangyin-custom-selected');
                    }
                }
            } else if (this.startMonth && cellMonth.getTime() === this.startMonth.getTime()) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        }
    }

    applyYearStyles(cell, year, type = '') {
        if (this.type === 'year') {
            if (this.multiSelect) {
                if (this.selectedYears.includes(year)) {
                    cell.classList.add('zhenshangyin-custom-selected');
                }
            } else if (this.selectedYears.length === 1 && this.selectedYears[0] === year) {
                cell.classList.add('zhenshangyin-custom-selected');
            }
        }
    }

    applyRangeStyles() {
        if (!this.picker) return;

        if (this._lastRangeStyledCells) {
            this._lastRangeStyledCells.forEach(cell => {
                cell.classList.remove('zhenshangyin-custom-selected', 'zhenshangyin-selected-range');
            });
        }
        if (this._lastHoverStyledCells) {
            this._lastHoverStyledCells.forEach(cell => {
                cell.classList.remove('zhenshangyin-hover-range');
            });
            this._lastHoverStyledCells = null;
        }

        this._lastRangeStyledCells = new Set();

        if (this.type === 'dateRange' && this.startDate) {
            this.applyDateRangeStyles();
        } else if (this.type === 'monthRange' && this.startMonth) {
            this.applyMonthRangeStyles();
        } else if (this.type === 'yearRange' && this.startYear) {
            this.applyYearRangeStyles();
        } else if (this.type === 'weekRange' && this.startDate) {
            this.applyWeekRangeStyles();
        }
    }

    applyDateRangeStyles() {
        this.picker.querySelectorAll('td[data-date]').forEach(cell => {
            const cellDate = this.parseDateKey(cell.dataset.date);
            if (this.startDate && this.endDate) {
                if (cellDate >= this.startDate && cellDate <= this.endDate) {
                    cell.classList.add('zhenshangyin-selected-range');
                    if (this.isSameDate(cellDate, this.startDate) || this.isSameDate(cellDate, this.endDate)) {
                        cell.classList.add('zhenshangyin-custom-selected');
                    }
                    if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
                }
            } else if (this.startDate && this.isSameDate(cellDate, this.startDate)) {
                cell.classList.add('zhenshangyin-custom-selected');
                if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
            }
        });
    }

    applyMonthRangeStyles() {
        this.picker.querySelectorAll('td[data-year][data-month]').forEach(cell => {
            const year = parseInt(cell.dataset.year);
            const month = parseInt(cell.dataset.month, 10);
            const cellMonth = new Date(year, month - 1, 1);

            if (this.startMonth && this.endMonth) {
                if (cellMonth >= this.startMonth && cellMonth <= this.endMonth) {
                    cell.classList.add('zhenshangyin-selected-range');
                    if (cellMonth.getTime() === this.startMonth.getTime() || cellMonth.getTime() === this.endMonth.getTime()) {
                        cell.classList.add('zhenshangyin-custom-selected');
                    }
                    if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
                }
            } else if (this.startMonth && cellMonth.getTime() === this.startMonth.getTime()) {
                cell.classList.add('zhenshangyin-custom-selected');
                if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
            }
        });
    }

    applyYearRangeStyles() {
        this.picker.querySelectorAll('td[data-year]').forEach(cell => {
            if (cell.dataset.yearmonthpanel) return;
            const year = parseInt(cell.dataset.year);
            if (this.startYear && this.endYear) {
                if (year >= this.startYear && year <= this.endYear) {
                    cell.classList.add('zhenshangyin-selected-range');
                    if (year === this.startYear || year === this.endYear) {
                        cell.classList.add('zhenshangyin-custom-selected');
                    }
                    if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
                }
            } else if (this.startYear && year === this.startYear) {
                cell.classList.add('zhenshangyin-custom-selected');
                if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
            }
        });
    }

    applyWeekRangeStyles() {
        this.picker.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td[data-date]');
            if (cells.length === 7) {
                const weekStart = this.parseDateKey(cells[0].dataset.date);
                const weekEnd = this.parseDateKey(cells[6].dataset.date);
                if (this.startDate && this.endDate) {
                    if (weekStart >= this.startDate && weekEnd <= this.endDate) {
                        cells.forEach(cell => {
                            cell.classList.add('zhenshangyin-selected-range');
                            cell.classList.add('zhenshangyin-custom-selected');
                            if (this._lastRangeStyledCells) this._lastRangeStyledCells.add(cell);
                        });
                    }
                }
            }
        });
    }

    setupRangeHoverEvents() {
        return;
    }

    setupMonthRangeHoverEvents() {
        return;
    }

    applyHoverRangeStyle(hoverDate) {
        if (!this.picker) return;

        if (this._lastHoverStyledCells) {
            this._lastHoverStyledCells.forEach(cell => cell.classList.remove('zhenshangyin-hover-range'));
        }
        this._lastHoverStyledCells = new Set();

        if (this.type === 'dateRange' && this.startDate) {
            const [rangeStart, rangeEnd] = this.startDate < hoverDate ? [this.startDate, hoverDate] : [hoverDate, this.startDate];
            this.picker.querySelectorAll('td[data-date]').forEach(cell => {
                const cellDate = new Date(cell.dataset.date);
                if (cellDate >= rangeStart && cellDate <= rangeEnd) {
                    cell.classList.add('zhenshangyin-hover-range');
                    this._lastHoverStyledCells.add(cell);
                }
            });
        } else if (this.type === 'monthRange' && this.startMonth) {
            const [rangeStart, rangeEnd] = this.startMonth < hoverDate ? [this.startMonth, hoverDate] : [hoverDate, this.startMonth];
            this.picker.querySelectorAll('td[data-year][data-month]').forEach(cell => {
                const year = parseInt(cell.dataset.year);
                const month = parseInt(cell.dataset.month, 10);
                const cellMonth = new Date(year, month - 1, 1);
                if (cellMonth >= rangeStart && cellMonth <= rangeEnd) {
                    cell.classList.add('zhenshangyin-hover-range');
                    this._lastHoverStyledCells.add(cell);
                }
            });
        }
    }

    scheduleHoverRangeUpdate(payload) {
        if (!payload) return;
        this._pendingHoverPayload = payload;
        if (this._hoverRangeRaf) return;
        this._hoverRangeRaf = requestAnimationFrame(() => {
            this._hoverRangeRaf = null;
            const p = this._pendingHoverPayload;
            this._pendingHoverPayload = null;
            if (!p) return;

            const key = p.mode === 'year' ? `y:${p.value}` : `d:${p.value instanceof Date ? p.value.getTime() : p.value}`;
            if (this._lastHoverKey === key) return;
            this._lastHoverKey = key;

            if (p.mode === 'year') {
                this.applyHoverYearRangeStyle(p.value);
            } else {
                this.applyHoverRangeStyle(p.value);
            }
        });
    }

    cancelHoverRangeUpdate() {
        this._pendingHoverPayload = null;
        this._lastHoverKey = null;
        if (this._hoverRangeRaf) {
            cancelAnimationFrame(this._hoverRangeRaf);
            this._hoverRangeRaf = null;
        }
    }

    handleConfirm() {
        if (this.type === 'time' || this.type === 'timeRange') {
            this.updateStandaloneTimeInputs();
            this.closePicker();
            return;
        }

        if (this.type === 'dateRange' && this.showTime) {
            if (!(this.startDate && this.endDate)) return;
        }
        this.updateInputValue();
        this.closePicker();
    }

    highlightWeek(row, highlight) {
        const cells = row.querySelectorAll('td[data-date]');
        cells.forEach(cell => {
            if (highlight) {
                cell.classList.add('zhenshangyin-hover-range');
            } else {
                cell.classList.remove('zhenshangyin-hover-range');
            }
        });
    }

    centerScroll(scrollElement, value) {
        const item = scrollElement.querySelector(`[data-value="${value}"]`);
        if (item) {
            scrollElement.querySelectorAll('.zhenshangyin-time-item').forEach(el =>
                el.classList.remove('zhenshangyin-time-selected'));
            item.classList.add('zhenshangyin-time-selected');

            const itemHeight = item.offsetHeight;
            const containerHeight = scrollElement.offsetHeight;
            const scrollTop = item.offsetTop - (containerHeight / 2) + (itemHeight / 2);
            scrollElement.scrollTop = scrollTop;
        }
    }

    updateInputValue() {
        let value = '';

        switch (this.type) {
            case 'date':
                if (this.multiSelect) {
                    value = Array.from(this.selectedDates).join(this.dateDelimiter);
                } else if (this.selectedDate) {
                    value = this.formatDateWithTime(this.selectedDate, this.showTime ? this.selectedTime : null);
                }
                break;
            case 'dateRange':
                if (this.startDate && this.endDate) {
                    const startStr = this.formatDateWithTime(this.startDate, this.showTime ? this.startTime : null);
                    const endStr = this.formatDateWithTime(this.endDate, this.showTime ? this.endTime : null);
                    value = `${startStr}${this.separator}${endStr}`;
                }
                break;
            case 'week':
                if (this.selectedWeek) {
                    value = `${this.formatDate(this.selectedWeek.start)}${this.separator}${this.formatDate(this.selectedWeek.end)}`;
                }
                break;
            case 'month':
                if (this.multiSelect) {
                    value = this.selectedMonths.map(m => this.formatMonth(m.year, m.month)).join(this.separator);
                } else if (this.selectedMonths.length > 0) {
                    const m = this.selectedMonths[0];
                    value = this.formatMonth(m.year, m.month);
                }
                break;
            case 'monthRange':
                if (this.startMonth && this.endMonth) {
                    value = `${this.formatMonth(this.startMonth.getFullYear(), this.startMonth.getMonth() + 1)}${this.separator}${this.formatMonth(this.endMonth.getFullYear(), this.endMonth.getMonth() + 1)}`;
                }
                break;
            case 'year':
                if (this.multiSelect) {
                    value = this.selectedYears.join(this.separator);
                } else if (this.selectedYears.length > 0) {
                    value = this.selectedYears[0].toString();
                }
                break;
            case 'yearRange':
                if (this.startYear && this.endYear) {
                    value = `${this.startYear}${this.separator}${this.endYear}`;
                }
                break;
            case 'time':
                value = this.formatTime(this.selectedTime);
                break;
            case 'timeRange':
                value = `${this.formatTime(this.startTime)}${this.separator}${this.formatTime(this.endTime)}`;
                break;
        }

        if (this.isSeparate && this.isRangeType()) {
            const parts = value.split(this.separator);
            if (parts.length === 2) {
                this.startInput.value = parts[0].trim();
                this.endInput.value = parts[1].trim();
            }
        } else {
            (this.dateInput || this.startInput).value = value;
        }

        this.onSelect(value);
    }

    formatDate(dateOrYear, month, day) {
        let date;
        if (arguments.length === 1 && dateOrYear instanceof Date) {
            date = dateOrYear;
        } else if (arguments.length === 3) {
            date = new Date(dateOrYear, month, day);
        } else {
            date = dateOrYear instanceof Date ? dateOrYear : new Date(dateOrYear);
        }

        let formatted = this.dateFormat
            .replace('YYYY', date.getFullYear())
            .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(date.getDate()).padStart(2, '0'));

        if (this.showTime && this.selectedTime) {
            formatted = formatted
                .replace('HH', String(this.selectedTime.hours).padStart(2, '0'))
                .replace('mm', String(this.selectedTime.minutes).padStart(2, '0'))
                .replace('ss', String(this.selectedTime.seconds).padStart(2, '0'));
        }

        return formatted;
    }


    formatDateWithTime(date, timeObj = null) {
        const d = date instanceof Date ? date : new Date(date);
        let result = this.dateFormat;
        result = result.replace('YYYY', String(d.getFullYear()));
        result = result.replace('MM', String(d.getMonth() + 1).padStart(2, '0'));
        result = result.replace('DD', String(d.getDate()).padStart(2, '0'));
        if (timeObj) {
            if (result.includes('HH')) result = result.replace('HH', String(timeObj.hours).padStart(2, '0'));
            if (result.includes('mm')) result = result.replace('mm', String(timeObj.minutes).padStart(2, '0'));
            if (result.includes('ss')) result = result.replace('ss', String(timeObj.seconds).padStart(2, '0'));
        } else {
            if (result.includes('HH')) result = result.replace('HH', '00');
            if (result.includes('mm')) result = result.replace('mm', '00');
            if (result.includes('ss')) result = result.replace('ss', '00');
        }
        return result;
    }

    formatMonth(year, month) {
        return this.dateFormat
            .replace('YYYY', year)
            .replace('MM', String(month).padStart(2, '0'));
    }

    formatTime(timeObj = null) {
        const time = timeObj || this.selectedTime;
        const parts = [];
        if (this.showHours) {
            parts.push(String(time.hours).padStart(2, '0'));
        }
        if (this.showMinutes) {
            parts.push(String(time.minutes).padStart(2, '0'));
        }
        if (this.showSeconds) {
            parts.push(String(time.seconds).padStart(2, '0'));
        }
        return parts.join(':');
    }

    formatDateOnlyForRange(type) {
        const d = type === 'start' ? this.startDate : this.endDate;
        if (!d) return this.language === 'en' ? 'No date selected' : '未选择日期';
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    isDateDisabled(date) {
        const dateStr = this.getDateKey(date);

        if (this.disabledItems.has(dateStr)) return true;
        if (this.disabledWeekdays.includes(date.getDay())) return true;

        for (const range of this.disabledRanges) {
            if (/\d{4}-\d{2}-\d{2}/.test(range.start) && /\d{4}-\d{2}-\d{2}/.test(range.end)) {
                const start = this.parseDateKey(range.start);
                const end = this.parseDateKey(range.end);
                if (date >= start && date <= end) return true;
            }
        }

        return false;
    }

    isMonthDisabled(year, month) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        if (this.disabledItems.has(monthStr)) return true;

        if (this.disabledRanges && this.disabledRanges.length) {
            const currentValue = year * 12 + month;
            for (const range of this.disabledRanges) {
                if (/\d{4}-\d{2}$/.test(range.start) && /\d{4}-\d{2}$/.test(range.end)) {
                    const [sy, sm] = range.start.split('-').map(v => parseInt(v, 10));
                    const [ey, em] = range.end.split('-').map(v => parseInt(v, 10));
                    const startValue = sy * 12 + (isNaN(sm) ? 1 : sm);
                    const endValue = ey * 12 + (isNaN(em) ? 12 : em);
                    if (currentValue >= startValue && currentValue <= endValue) return true;
                }
            }
        }

        return false;
    }

    isYearDisabled(year) {
        if (this.disabledItems.has(year)) return true;
        if (this.disabledRanges && this.disabledRanges.length) {
            for (const range of this.disabledRanges) {
                if (typeof range.start === 'number' && typeof range.end === 'number') {
                    if (year >= range.start && year <= range.end) return true;
                }
            }
        }
        return false;
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    isSameWeek(date1, date2) {
        const startOfWeek1 = new Date(date1);
        startOfWeek1.setDate(date1.getDate() - date1.getDay());
        const startOfWeek2 = new Date(date2);
        startOfWeek2.setDate(date2.getDate() - date2.getDay());
        return this.isSameDate(startOfWeek1, startOfWeek2);
    }

    normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    getDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    parseDateKey(key) {
        const [y, m, d] = key.split('-').map(n => parseInt(n, 10));
        return new Date(y, m - 1, d);
    }

    togglePicker() {
        const updateCalendarPosition = () => {
            if (!this.picker) return;

            let targetInput = this.isSeparate ?
                this.startInput :
                this.dateInput;

            let rect = targetInput.getBoundingClientRect();
            let rectheight = targetInput.offsetHeight;
            let spaceBelow = window.innerHeight - rect.bottom;
            let distanceFromTop = rect.top + window.scrollY;

            this.picker.classList.add('zhenshangyin-custom-show');
            this.lockPickerContentWidth();
            const pickerHeight = this.picker.offsetHeight;
            const pickerWidth = this.picker.offsetWidth;

            if (this.isSeparate && this.isRangeType()) {
                const spaceLeft = rect.left;
                if (spaceLeft + pickerWidth > window.innerWidth) {
                    targetInput = this.endInput;
                    rect = targetInput.getBoundingClientRect();
                    rectheight = targetInput.offsetHeight;
                    spaceBelow = window.innerHeight - rect.bottom;
                    distanceFromTop = rect.top + window.scrollY;
                }
            }

            if (spaceBelow < pickerHeight && distanceFromTop < pickerHeight) {
                this.picker.style.top = `${distanceFromTop + rectheight}px`;
                this.picker.classList.add('zhenshangyin-custom-down');
                this.picker.classList.remove('zhenshangyin-custom-up');
            } else if (spaceBelow < pickerHeight) {
                this.picker.style.top = `${distanceFromTop - pickerHeight}px`;
                this.picker.classList.add('zhenshangyin-custom-up');
                this.picker.classList.remove('zhenshangyin-custom-down');
            } else {
                this.picker.style.top = `${distanceFromTop + rectheight}px`;
                this.picker.classList.add('zhenshangyin-custom-down');
                this.picker.classList.remove('zhenshangyin-custom-up');
            }

            const spaceLeft = rect.left;
            const spaceRight = window.innerWidth - rect.right;
            const preferLeft = (this.type === 'time') || (this.type === 'dateRange' && this.showTime) || (this.type === 'weekRange' && this.showTime);

            if (preferLeft) {
                let left = rect.left + window.scrollX;
                if (left + pickerWidth > window.innerWidth) {
                    left = Math.max(0, rect.right + window.scrollX - pickerWidth);
                    this.picker.classList.add('zhenshangyin-custom-right');
                } else {
                    this.picker.classList.remove('zhenshangyin-custom-right');
                }
                this.picker.style.left = `${left}px`;
            } else {
                if (this.isSeparate && this.isRangeType() && targetInput === this.endInput) {
                    this.picker.style.left = `${rect.right + window.scrollX - pickerWidth}px`;
                    this.picker.classList.add('zhenshangyin-custom-right');
                } else if (spaceLeft + pickerWidth <= window.innerWidth) {
                    this.picker.style.left = `${rect.left + window.scrollX}px`;
                    this.picker.classList.remove('zhenshangyin-custom-right');
                } else if (spaceRight + pickerWidth <= window.innerWidth) {
                    this.picker.style.left = `${rect.right + window.scrollX - pickerWidth}px`;
                    this.picker.classList.add('zhenshangyin-custom-right');
                } else {
                    this.picker.style.left = `${rect.left + window.scrollX}px`;
                }
            }
        };

        if (this._isOpen) {
            updateCalendarPosition();
            return;
        }

        this._isOpen = true;
        this._onWindowScroll = this._onWindowScroll || (() => updateCalendarPosition());
        this._onWindowResize = this._onWindowResize || (() => updateCalendarPosition());
        window.addEventListener('scroll', this._onWindowScroll);
        window.addEventListener('resize', this._onWindowResize);
        updateCalendarPosition();
    }

    cleanupCustomScrollbars() {
        if (!this._customScrollbarElements || !this._customScrollbarElements.size) return;
        this._customScrollbarElements.forEach(el => {
            if (!el) return;
            if (el._customScrollbarCleanup) {
                el._customScrollbarCleanup();
                el._customScrollbarCleanup = null;
            }
        });
        this._customScrollbarElements.clear();
    }

    closePicker() {
        this._isOpen = false;
        this.cancelHoverRangeUpdate();
        this.cleanupCustomScrollbars();
        this.cleanupTimeScrollListeners();
        this._currentTimeBtnBound = false;
        this._standaloneNowBtnBound = false;
        this._onStandaloneNowBtnClick = null;
        if (this.picker) {
            const pickerToRemove = this.picker;
            this.picker.classList.remove('zhenshangyin-custom-show');
            if (this._pickerRemoveTimer) {
                clearTimeout(this._pickerRemoveTimer);
                this._pickerRemoveTimer = null;
            }
            this._pickerRemoveTimer = setTimeout(() => {
                if (this.picker === pickerToRemove) {
                    if (this._onPickerClick) {
                        this.picker.removeEventListener('click', this._onPickerClick);
                        this._onPickerClick = null;
                    }
                    if (this._onPickerMouseOver) {
                        this.picker.removeEventListener('mouseover', this._onPickerMouseOver);
                        this._onPickerMouseOver = null;
                    }
                    if (this._onPickerMouseOut) {
                        this.picker.removeEventListener('mouseout', this._onPickerMouseOut);
                        this._onPickerMouseOut = null;
                    }
                    this.picker.remove();
                    this.picker = null;
                    this.dom = null;
                    this.domById = null;
                }
            }, 250);
        }
        this._pickerContentWidthLocked = false;
        if (this._onWindowScroll) {
            window.removeEventListener('scroll', this._onWindowScroll);
            this._onWindowScroll = null;
        }
        if (this._onWindowResize) {
            window.removeEventListener('resize', this._onWindowResize);
            this._onWindowResize = null;
        }
        if (this._onDocClickDropdown) {
            document.removeEventListener('click', this._onDocClickDropdown);
            this._onDocClickDropdown = null;
        }
        if (this._onDocClickDropdownStart) {
            document.removeEventListener('click', this._onDocClickDropdownStart);
            this._onDocClickDropdownStart = null;
        }
        if (this._onDocClickDropdownEnd) {
            document.removeEventListener('click', this._onDocClickDropdownEnd);
            this._onDocClickDropdownEnd = null;
        }

        if (this._onCurrentTimeBtnClick) {
            this._onCurrentTimeBtnClick = null;
        }
    }

    cleanup() {
        if (this.styleElement && document.head.contains(this.styleElement)) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
        this.cleanupCustomScrollbars();
        this.cleanupTimeScrollListeners();
        if (this._onInputClickHandler) {
            if (this.isSeparate) {
                if (this.startInput) this.startInput.removeEventListener('click', this._onInputClickHandler);
                if (this.endInput) this.endInput.removeEventListener('click', this._onInputClickHandler);
            } else if (this.dateInput) {
                this.dateInput.removeEventListener('click', this._onInputClickHandler);
            }
            this._onInputClickHandler = null;
        }
        if (this._onDocumentClickClose) {
            document.removeEventListener('click', this._onDocumentClickClose);
            this._onDocumentClickClose = null;
        }
        if (this._onDocumentFocusinClose) {
            document.removeEventListener('focusin', this._onDocumentFocusinClose);
            this._onDocumentFocusinClose = null;
        }
        this.closePicker();
    }

    destroy() {
        this.cleanup();
    }
}

class ZhenshangyinNotification {
    constructor({ title, message, type = 'info', duration = 2000 }) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.init();
    }
    init() {
        this.createContainer();
        this.createNotification();
    }
    createContainer() {
        if (!document.getElementById('zhenshangyin-notification-container')) {
            const container = document.createElement('div');
            container.id = 'zhenshangyin-notification-container';
            container.className = 'zhenshangyin-notification-container';
            document.body.appendChild(container);
        }
    }
    createNotification() {
        const container = document.getElementById('zhenshangyin-notification-container');
        const notification = document.createElement('div');
        notification.className = `zhenshangyin-notification ${this.type}`;
        notification.innerHTML = `
                            <div class="zhenshangyin-notification-title">
                                <div class="zhenshangyin-notification-icon">${this.getIcon()}</div>
                            <h2> ${this.title}</h2>
                                <div class="zhenshangyin-notification-close">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512l252.288-252.288a31.936 31.936 0 1 0-45.12-45.12z"></path></svg>
                                </div>
                            </div>
                            <div class="zhenshangyin-notification-message">${this.message}</div>

                    `;
        notification.querySelector('.zhenshangyin-notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        container.appendChild(notification);
        setTimeout(() => notification.classList.add('zhenshangyin-notification-show'), 50);
        if (this.duration) {
            setTimeout(() => this.hideNotification(notification), this.duration);
        }
    }
    getIcon() {
        switch (this.type) {
            case 'error':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"></path></svg>`;
            case 'warning':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"></path></svg>`;
            case 'info':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256m0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4"></path></svg>`;
            case 'success':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"></path></svg>`;
            default:
                return '';
        }
    }
    hideNotification(notification) {
        notification.classList.add('zhenshangyin-notification-hide');
        setTimeout(() => notification.remove(), 500);
    }
}

class ZhenshangyinMessage {
    constructor({ message, type = 'info', duration = 2000 }) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.init();
    }
    init() {
        this.createContainer();
        this.createMessage();
    }
    createContainer() {
        if (!document.getElementById('zhenshangyin-message-container')) {
            const container = document.createElement('div');
            container.id = 'zhenshangyin-message-container';
            container.className = 'zhenshangyin-message-container';
            document.body.appendChild(container);
        }
    }
    createMessage() {
        const container = document.getElementById('zhenshangyin-message-container');
        const messageElement = document.createElement('div');
        messageElement.className = `zhenshangyin-message ${this.type}`;
        messageElement.innerHTML = `${this.getIcon()} ${this.message}`;

        container.appendChild(messageElement);
        setTimeout(() => messageElement.classList.add('zhenshangyin-message-show'), 50);

        if (this.duration) {
            setTimeout(() => this.hideMessage(messageElement), this.duration);
        }
    }
    getIcon() {
        switch (this.type) {
            case 'error':
                return `<svg class="zhenshangyin-message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"></path></svg>`;
            case 'warning':
                return `<svg class="zhenshangyin-message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"></path></svg>`;
            case 'info':
                return `<svg class="zhenshangyin-message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256m0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4"></path></svg>`;
            case 'success':
                return `<svg class="zhenshangyin-message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"></path></svg>`;
            default:
                return '';
        }
    }
    hideMessage(el) {
        el.classList.add('zhenshangyin-message-hide');
        setTimeout(() => {
            const container = document.getElementById('zhenshangyin-message-container');
            container.removeChild(el);
            if (!container.hasChildNodes()) {
                document.body.removeChild(container);
                const style = document.getElementById('zhenshangyin-message-style');
                if (style) document.head.removeChild(style);
            }
        }, 600);
    }
}

class ZhenshangyinDropdown {
    constructor({
        container,
        multiInputs,
        data,
        customParams,
        onSelect,
        searchEnabled = false,
        inputSearchEnabled = false,
        defaultSelected = null,
        grouped = false,
        multiSelect = false,
        inputMultiSelect = false,
        language = 'zh',
        hoverEnabled = false,
        disabled = false,
        separator = ' / '
    }) {
        this.isMultiInputMode = Array.isArray(multiInputs) && multiInputs.length > 0;
        this.inputElements = this.isMultiInputMode
            ? multiInputs.map(selector => document.querySelector(selector)).filter(Boolean)
            : [document.querySelector(container)];

        if (!this.inputElements.length) {
            return;
        }

        this.container = this.inputElements[0];
        this.items = data;
        this.customParams = customParams || {};
        this.onSelect = onSelect || (() => { });
        this.searchEnabled = searchEnabled;
        this.inputSearchEnabled = inputSearchEnabled;
        this.defaultSelected = defaultSelected;
        this.grouped = grouped;
        this.multiSelect = multiSelect;
        this.inputMultiSelect = inputMultiSelect;
        this.language = language;
        this.hoverEnabled = hoverEnabled;
        this.disabled = disabled;
        this.separator = separator;
        this.dropdown = null;
        this.selectedItems = multiSelect ? [] : null;
        this.selectedPathValues = [];
        this.renderedItems = [];
        this.itemClickHandler = null;
        this.init();
    }
    init() {
        if (this.disabled) {
            this.inputElements.forEach(el => {
                if (!el) return;
                el.disabled = true;
                el.style.cursor = 'not-allowed';
                el.style.backgroundColor = '#f5f5f5';
            });
            return;
        }

        if (this.isMultiInputMode) {
            this.inputElements.forEach((el, index) => {
                if (!el) return;
                el.onclick = (event) => this.showDropdown(event, index);
            });
        } else {
            this.container.onclick = (event) => this.showDropdown(event);
        }

        if (this.hoverEnabled) {
            this.container.onmouseenter = (event) => this.showDropdown(event);
            this.container.onmouseleave = () => {
                if (this.dropdown) {
                    const hideDropdown = () => {
                        if (!this.dropdown.matches(':hover')) {
                            this.dropdown.classList.remove('zhenshangyin-dropdown-show');
                            setTimeout(() => {
                                if (this.dropdown) {
                                    this.dropdown.classList.remove('zhenshangyin-dropdown-down');
                                    this.dropdown.classList.remove('zhenshangyin-dropdown-up');
                                }
                            }, 250);
                            setTimeout(() => {
                                if (this.dropdown) {
                                    this.dropdown.remove();
                                    this.dropdown = null;
                                }
                            }, 300);
                        }
                    };

                    if (this.dropdown) {
                        this.dropdown.onmouseleave = hideDropdown;
                    }

                    setTimeout(hideDropdown, 100);
                }
            };
        }

        if (this.inputSearchEnabled) {
            this.container.addEventListener('input', (e) => this.filterItems(e.target.value));
        }
        if (this.defaultSelected) {
            const flatItems = this.grouped ? this.flattenGroupedItems(this.items) : this.items;
            if (this.multiSelect) {
                this.selectedItems = flatItems.filter(item => this.defaultSelected.includes(item.title));
                this.updateInput();
            } else {
                this.selectedItems = flatItems.find(item => item.title === this.defaultSelected);
                this.container.value = this.selectedItems ? this.selectedItems.title : '';
            }
        }
    }
    flattenGroupedItems(items) {
        return items.reduce((acc, group) => acc.concat(group.children || []), []);
    }
    showDropdown(event, level = 0) {
        if (this.dropdown) {
            this.cleanupEventListeners();
            this.dropdown.remove();
        }

        if (this.isMultiInputMode && level > 0) {
            for (let i = 0; i < level; i++) {
                if (!this.selectedPathValues[i]) {
                    return;
                }
            }
        }

        this.activeLevel = level;
        this.activeInput = this.isMultiInputMode ? this.inputElements[level] : this.container;
        if (!this.activeInput) {
            return;
        }
        this.dropdown = document.createElement('div');
        this.dropdown.className = `zhenshangyin-dropdown`;
        if (this.searchEnabled && !this.inputSearchEnabled) {
            this.searchWrapper = document.createElement('div');
            this.searchWrapper.className = 'zhenshangyin-dropdown-search-wrapper';
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'zhenshangyin-dropdown-search';
            searchInput.placeholder = this.language === 'zh' ? '搜索...' : 'Search...';
            searchInput.oninput = (e) => this.filterItems(e.target.value);
            this.searchWrapper.appendChild(searchInput);
            this.dropdown.appendChild(this.searchWrapper);
        }
        this.dropdown.style.minWidth = `${this.activeInput.offsetWidth}px`;
        this.dropdown.style.width = 'max-content';
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = 'zhenshangyin-dropdown-content';
        this.dropdown.appendChild(this.contentWrapper);

        this.renderedItems = [];
        this.itemClickHandler = (e) => {
            const itemDiv = e.target.closest('.zhenshangyin-dropdown-item');
            if (!itemDiv || !this.contentWrapper || !this.contentWrapper.contains(itemDiv)) {
                return;
            }

            e.stopPropagation();

            const index = Number(itemDiv.dataset.itemIndex);
            const item = this.renderedItems[index];
            if (!item || item.disabled) {
                return;
            }

            this.selectItem(item);
        };
        this.contentWrapper.addEventListener('click', this.itemClickHandler);

        const itemsToRender = this.isMultiInputMode
            ? this.getItemsForLevel(this.activeLevel)
            : this.items;

        if (this.grouped) {
            itemsToRender.forEach(group => this.createGroup(group));
        } else {
            this.createItems(itemsToRender);
        }
        const updatePosition = () => {
            if (!this.dropdown) return;
            const rect = this.activeInput.getBoundingClientRect();
            const rectHeight = this.activeInput.offsetHeight;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top + window.scrollY;

            if (!document.body.contains(this.dropdown)) {
                document.body.appendChild(this.dropdown);
            }
            const pickerHeight = this.dropdown.offsetHeight;
            const pickerWidth = this.dropdown.offsetWidth;
            this.dropdown.classList.add('zhenshangyin-dropdown-show');
            if (spaceBelow >= pickerHeight) {
                this.dropdown.classList.add('zhenshangyin-dropdown-down');
                this.dropdown.classList.remove('zhenshangyin-dropdown-up');
                this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            } else if (spaceAbove >= pickerHeight) {
                this.dropdown.classList.add('zhenshangyin-dropdown-up');
                this.dropdown.classList.remove('zhenshangyin-dropdown-down');
                this.dropdown.style.top = `${spaceAbove - pickerHeight}px`;
            } else {
                this.dropdown.classList.add('zhenshangyin-dropdown-down');
                this.dropdown.classList.remove('zhenshangyin-dropdown-up');
                this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            }

            if (rect.left + pickerWidth <= window.innerWidth) {
                this.dropdown.style.left = `${rect.left + window.scrollX}px`;
            } else if (window.innerWidth - rect.right >= pickerWidth) {
                this.dropdown.style.left = `${rect.right + window.scrollX - pickerWidth}px`;
            } else {
                this.dropdown.style.left = `${rect.left + window.scrollX}px`;
            }
        };
        this.scrollHandler = () => {
            if (this.dropdown && document.body.contains(this.dropdown)) {
                updatePosition();
            } else {
                this.cleanupEventListeners();
            }
        };
        this.resizeHandler = () => {
            if (this.dropdown && document.body.contains(this.dropdown)) {
                updatePosition();
            } else {
                this.cleanupEventListeners();
            }
        };
        window.addEventListener('scroll', this.scrollHandler);
        window.addEventListener('resize', this.resizeHandler);
        updatePosition();
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
        }
        this.documentClickHandler = this.removeDropdown.bind(this);
        document.addEventListener('click', this.documentClickHandler);

        if (this.focusinHandler) {
            document.removeEventListener('focusin', this.focusinHandler);
        }
        this.focusinHandler = (e) => {
            const shouldKeepOpen = this.isMultiInputMode
                ? this.inputElements.some(el => el === e.target)
                : e.target === this.container;

            if (!this.dropdown || (!this.dropdown.contains(e.target) && !shouldKeepOpen)) {
                this.removeDropdown(e);
            }
        };
        document.addEventListener('focusin', this.focusinHandler);
    }
    cleanupEventListeners() {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
        }
        if (this.focusinHandler) {
            document.removeEventListener('focusin', this.focusinHandler);
        }

        if (this.contentWrapper && this.itemClickHandler) {
            this.contentWrapper.removeEventListener('click', this.itemClickHandler);
        }
    }
    removeDropdown(event) {
        const shouldKeepOpen = this.isMultiInputMode
            ? this.inputElements.some(el => el === event.target)
            : event.target === this.container;

        if (!this.dropdown || (!this.dropdown.contains(event.target) && !shouldKeepOpen)) {
            if (this.dropdown) {
                this.dropdown.classList.remove('zhenshangyin-dropdown-show');
                setTimeout(() => {
                    if (this.dropdown) {
                        this.dropdown.classList.remove('zhenshangyin-dropdown-down');
                        this.dropdown.classList.remove('zhenshangyin-dropdown-up');
                    }
                }, 250);
                this.cleanupEventListeners();
                setTimeout(() => {
                    if (this.dropdown) {
                        this.dropdown.remove();
                        this.dropdown = null;
                    }
                }, 300);
            }
        }
    }
    createGroup(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'zhenshangyin-dropdown-group';
        const groupTitle = document.createElement('div');
        groupTitle.className = 'zhenshangyin-dropdown-group-title';
        groupTitle.textContent = group.groupTitle || (this.language === 'zh' ? '分组' : 'Group');
        groupDiv.appendChild(groupTitle);
        this.createItems(group.children, groupDiv);
        this.contentWrapper.appendChild(groupDiv);
    }
    createItems(items, container = null) {
        const targetContainer = container || this.contentWrapper;
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'zhenshangyin-dropdown-item';
            div.dataset.itemIndex = String(this.renderedItems.length);
            this.renderedItems.push(item);
            if (item.disabled) {
                div.classList.add('zhenshangyin-dropdown-item-disabled');
            }
            div.textContent = this.isMultiInputMode ? item.name : item.title;
            targetContainer.appendChild(div);

            if (this.isMultiInputMode) {
                if (this.selectedPathValues[this.activeLevel] === item.name) {
                    div.classList.add('zhenshangyin-dropdown-item-selected');
                }
                return;
            }
            if (
                (this.multiSelect && this.selectedItems.some(selected => selected.title === item.title)) ||
                (!this.multiSelect && this.selectedItems && this.selectedItems.title === item.title)
            ) {
                div.classList.add(this.multiSelect ? 'zhenshangyin-dropdown-item-selected-multiSelect' : 'zhenshangyin-dropdown-item-selected');
            }
        });
    }
    filterItems(query) {
        if (this.isMultiInputMode) {
            const items = this.getItemsForLevel(this.activeLevel || 0);
            const filteredItems = items.filter(item =>
                (item.name || '').toLowerCase().includes(query.toLowerCase())
            );
            this.updateDropdown(filteredItems);
            return;
        }
        if (this.grouped) {
            const filteredGroups = this.items.map(group => {
                const filteredChildren = group.children.filter(item =>
                    item.title.toLowerCase().includes(query.toLowerCase())
                );
                return {
                    ...group,
                    children: filteredChildren,
                };
            }).filter(group => group.children.length > 0);

            this.updateGroupedDropdown(filteredGroups);
        } else {
            const filteredItems = this.items.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            this.updateDropdown(filteredItems);
        }
    }
    updateGroupedDropdown(filteredGroups) {
        this.renderedItems = [];
        const dropdownGroups = this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-group');
        dropdownGroups.forEach(group => group.remove());
        filteredGroups.forEach(group => this.createGroup(group));
    }
    updateDropdown(items) {
        this.renderedItems = [];
        const dropdownItems = this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-item');
        dropdownItems.forEach(item => item.remove());
        this.createItems(items);
    }
    selectItem(item) {
        if (item.disabled) {
            return;
        }

        if (this.isMultiInputMode) {
            this.selectItemForMultiInputs(item);
            return;
        }
        if (this.multiSelect) {
            const isSelected = this.selectedItems.some(selected => selected.title === item.title);
            if (isSelected) {
                this.selectedItems = this.selectedItems.filter(selected => selected.title !== item.title);
            } else {
                this.selectedItems.push(item);
            }
            this.updateInput();
            const items = this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-item');
            items.forEach(dropdownItem => {
                if (this.selectedItems.some(selected => selected.title === dropdownItem.textContent)) {
                    dropdownItem.classList.add('zhenshangyin-dropdown-item-selected-multiSelect');
                } else {
                    dropdownItem.classList.remove('zhenshangyin-dropdown-item-selected-multiSelect');
                }
            });
        } else {
            this.container.value = item.title;
            const selectedItems = this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-item-selected');
            selectedItems.forEach((selectedItem) => {
                selectedItem.classList.remove('zhenshangyin-dropdown-item-selected');
            });
            const selectedItem = Array.from(this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-item')).find(child => child.textContent === item.title);
            if (selectedItem) {
                selectedItem.classList.add('zhenshangyin-dropdown-item-selected');
            }
            this.selectedItems = item;
            this.dropdown.classList.remove('zhenshangyin-dropdown-show');
            setTimeout(() => {
                if (this.dropdown) {
                    this.dropdown.classList.remove('zhenshangyin-dropdown-down');
                    this.dropdown.classList.remove('zhenshangyin-dropdown-up');
                }
            }, 250);
            setTimeout(() => {
                if (this.dropdown) {
                    this.dropdown.remove();
                }
            }, 300);
        }
        this.onSelect(item);
    }
    updateInput() {
        if (this.inputMultiSelect) {
            this.container.value = this.selectedItems.map(item => item.title).join(', ');
        } else {
            this.container.innerHTML = '';
            this.selectedItems.forEach((item, index) => {
                const itemText = item.title;
                const removeButton = this.createRemoveButton(item);
                const itemElement = document.createElement('div');
                itemElement.classList.add('zhenshangyin-dropdown-multiSelect');
                itemElement.textContent = itemText;
                itemElement.appendChild(removeButton);
                this.container.appendChild(itemElement);
            });
        }
    }
    createRemoveButton(item) {
        const removeButton = document.createElement('div');
        removeButton.classList.add('zhenshangyin-dropdown-multiSelect-Button');
        removeButton.textContent = ' ×';
        removeButton.onclick = (event) => {
            event.stopPropagation();
            this.removeItem(item);
        };
        return removeButton;
    }
    removeItem(item) {
        this.selectedItems = this.selectedItems.filter(selected => selected.title !== item.title);

        this.updateInput();

        if (this.dropdown && this.contentWrapper) {
            const items = this.contentWrapper.querySelectorAll('.zhenshangyin-dropdown-item');
            items.forEach(dropdownItem => {
                if (this.selectedItems.some(selected => selected.title === dropdownItem.textContent)) {
                    dropdownItem.classList.add('zhenshangyin-dropdown-item-selected-multiSelect');
                } else {
                    dropdownItem.classList.remove('zhenshangyin-dropdown-item-selected-multiSelect');
                }
            });
        }

        this.onSelect(item);
    }

    getItemsForLevel(level) {
        if (!Array.isArray(this.items)) return [];
        let data = this.items;
        for (let i = 0; i < level; i++) {
            const selectedValue = this.selectedPathValues[i];
            if (!selectedValue) {
                return [];
            }
            const selectedItem = data.find(it => it && it.name === selectedValue);
            data = selectedItem && Array.isArray(selectedItem.children) ? selectedItem.children : [];
        }
        return data;
    }

    selectItemForMultiInputs(item) {
        if (!item || typeof item.name !== 'string') {
            return;
        }

        const level = this.activeLevel || 0;
        this.selectedPathValues[level] = item.name;

        for (let i = level + 1; i < this.inputElements.length; i++) {
            this.selectedPathValues[i] = null;
            const el = this.inputElements[i];
            if (el) el.value = '';
        }

        const currentEl = this.inputElements[level];
        if (currentEl) currentEl.value = item.name;

        const fullSelection = this.selectedPathValues.filter(Boolean).join(this.separator);
        this.onSelect({ selection: fullSelection, values: [...this.selectedPathValues], level: level, item });
        this.removeDropdown({ target: document.body });
    }
}

class ZhenshangyinInfiniteScroll {
    constructor(selector, options = {}) {
        const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!container || !(container instanceof HTMLElement)) {
            return;
        }
        this.container = container;
        this.direction = options.direction || 'left';
        if (!['up', 'down', 'left', 'right'].includes(this.direction)) {
            return;
        }
        const defaultSpeed = 50;
        this.speed = typeof options.speed === 'number' && options.speed > 0
            ? options.speed
            : defaultSpeed;
        this.hoverPause = options.hoverPause !== false;
        this.isRunning = false;
        this.isPaused = false;
        this.animationFrame = null;
        this.lastTimestamp = 0;
        this.scrollPosition = 0;
        this.originalCount = 0;
        this.segmentSize = 0;
        this.baseOffset = 0;
        this._originalNodes = null;
        this._prevStyle = {
            overflow: this.container.style.overflow,
            display: this.container.style.display,
            flexDirection: this.container.style.flexDirection,
            flexWrap: this.container.style.flexWrap,
        };
        this._onResize = null;
        this._resizeRaf = null;
        this._onMouseEnter = null;
        this._onMouseLeave = null;
        this._onVisibilityChange = null;
        this.applyBaseLayout();
        this.initAfterImages();
    }


    applyBaseLayout() {
        this.container.style.overflow = 'hidden';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = this.isVertical ? 'column' : 'row';
        this.container.style.flexWrap = 'nowrap';
    }


    initAfterImages() {
        const images = Array.from(this.container.querySelectorAll('img'));
        if (images.length === 0) {
            this.init();
            return;
        }
        let pending = 0;
        const onDone = () => {
            pending--;
            if (pending <= 0) {
                images.forEach(img => {
                    img.removeEventListener('load', onDone);
                    img.removeEventListener('error', onDone);
                });
                this.init();
            }
        };
        images.forEach(img => {
            if (img.complete) {
                return;
            }
            pending++;
            img.addEventListener('load', onDone);
            img.addEventListener('error', onDone);
        });
        if (pending === 0) {
            this.init();
        }
    }


    init() {
        const originals = Array.from(this.container.children);
        this.originalCount = originals.length;
        if (this.originalCount === 0) return;

        this._originalNodes = originals.map(node => node.cloneNode(true));
        const totalItemSize = this.measureElementsSize(originals);
        const cloneCount = this.calculateRequiredClones(totalItemSize);
        this.buildClonedContent(originals, cloneCount);

        if (this.hoverPause) {
            this.bindHoverEvents();
        }

        this.bindResizeEvent();
        this.bindVisibilityEvent();
        this.remeasureAndReset();
        if (this.shouldScroll()) {
            this.start();
        } else {
            this.stop();
        }
    }

    applyFixedChildFlex() {
        const children = Array.from(this.container.children);
        children.forEach(child => {
            child.style.flex = '0 0 auto';
        });
    }

    buildClonedContent(originals, cloneCount) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 1 + cloneCount; i++) {
            for (let j = 0; j < originals.length; j++) {
                const cloned = originals[j].cloneNode(true);
                if (i > 0 && cloned instanceof Element) {
                    if (cloned.hasAttribute('id')) {
                        cloned.removeAttribute('id');
                    }
                    const withId = cloned.querySelectorAll('[id]');
                    for (let k = 0; k < withId.length; k++) {
                        withId[k].removeAttribute('id');
                    }
                }
                fragment.appendChild(cloned);
            }
        }
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        this.applyFixedChildFlex();
    }

    measureElementsSize(elements) {
        if (!elements || elements.length === 0) return 0;
        let total = 0;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            total += this.isVertical ? el.offsetHeight : el.offsetWidth;
        }
        return total;
    }

    calculateRequiredClones(totalItemSize) {
        const minRepeats = 3;
        if (!totalItemSize || totalItemSize <= 0) return minRepeats - 1;
        const containerSize = this.isVertical ? this.container.clientHeight : this.container.clientWidth;
        const requiredRepeats = Math.ceil(2 + (containerSize / totalItemSize));
        return Math.max(minRepeats, requiredRepeats) - 1;
    }

    get containerSize() {
        return this.isVertical ? this.container.clientHeight : this.container.clientWidth;
    }

    shouldScroll() {
        const contentSize = this.isVertical ? this.container.scrollHeight : this.container.scrollWidth;
        return contentSize > this.containerSize;
    }

    get isVertical() {
        return this.direction === 'up' || this.direction === 'down';
    }

    get isReverse() {
        return this.direction === 'down' || this.direction === 'right';
    }

    remeasureAndReset() {
        this.segmentSize = this.measureSegmentSize();
        if (this.segmentSize === 0) {
            return;
        }
        if (!this.shouldScroll()) {
            this.baseOffset = 0;
            this.scrollPosition = 0;
            this.applyScroll();
            this.stop();
            return;
        }
        this.baseOffset = this.segmentSize;
        this.scrollPosition = 0;
        this.applyFixedChildFlex();
        this.applyScroll();
    }

    bindResizeEvent() {
        if (this._onResize) return;
        this._onResize = () => {
            if (this._resizeRaf) {
                cancelAnimationFrame(this._resizeRaf);
            }
            this._resizeRaf = requestAnimationFrame(() => {
                this._resizeRaf = null;
                this.remeasureAndReset();
                if (this.shouldScroll()) {
                    if (!this.isPaused) {
                        this.start();
                    }
                }
            });
        };
        window.addEventListener('resize', this._onResize);
    }

    bindVisibilityEvent() {
        if (this._onVisibilityChange) return;
        this._onVisibilityChange = () => {
            if (document.hidden) {
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }
                this.lastTimestamp = 0;
                return;
            }

            if (this.isRunning && !this.isPaused && !this.animationFrame && this.shouldScroll()) {
                this.lastTimestamp = 0;
                this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
            }
        };
        document.addEventListener('visibilitychange', this._onVisibilityChange);
    }

    bindHoverEvents() {
        if (this._onMouseEnter || this._onMouseLeave) return;
        this._onMouseEnter = () => {
            this.isPaused = true;
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        };
        this._onMouseLeave = () => {
            this.isPaused = false;
            if (this.isRunning) {
                this.lastTimestamp = 0;
                this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
            }
        };
        this.container.addEventListener('mouseenter', this._onMouseEnter);
        this.container.addEventListener('mouseleave', this._onMouseLeave);
    }

    applyScroll() {
        const signed = this.isReverse ? -this.scrollPosition : this.scrollPosition;
        const offset = this.baseOffset + signed;
        if (this.isVertical) {
            this.container.scrollTop = offset;
        } else {
            this.container.scrollLeft = offset;
        }
    }

    measureSegmentSize() {
        const children = Array.from(this.container.children);
        let total = 0;
        for (let i = 0; i < this.originalCount; i++) {
            const el = children[i];
            total += this.isVertical ? el.offsetHeight : el.offsetWidth;
        }
        return total;
    }

    start() {
        if (this.isRunning || this.segmentSize === 0) return;
        this.isRunning = true;
        this.lastTimestamp = 0;
        this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.lastTimestamp = 0;
    }

    refresh() {
        if (!this._originalNodes || this._originalNodes.length === 0) {
            this.initAfterImages();
            return;
        }
        this.stop();
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this._originalNodes.length; i++) {
            fragment.appendChild(this._originalNodes[i].cloneNode(true));
        }
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        this.applyBaseLayout();
        this.initAfterImages();
    }

    destroy() {
        this.stop();
        this.isPaused = false;
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            this._onResize = null;
        }
        if (this._resizeRaf) {
            cancelAnimationFrame(this._resizeRaf);
            this._resizeRaf = null;
        }
        if (this._onMouseEnter) {
            this.container.removeEventListener('mouseenter', this._onMouseEnter);
            this._onMouseEnter = null;
        }
        if (this._onMouseLeave) {
            this.container.removeEventListener('mouseleave', this._onMouseLeave);
            this._onMouseLeave = null;
        }
        if (this._onVisibilityChange) {
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
            this._onVisibilityChange = null;
        }
        if (this._originalNodes && this._originalNodes.length) {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < this._originalNodes.length; i++) {
                fragment.appendChild(this._originalNodes[i].cloneNode(true));
            }
            this.container.innerHTML = '';
            this.container.appendChild(fragment);
        }
        this._originalNodes = null;
        this.container.style.overflow = this._prevStyle.overflow;
        this.container.style.display = this._prevStyle.display;
        this.container.style.flexDirection = this._prevStyle.flexDirection;
        this.container.style.flexWrap = this._prevStyle.flexWrap;
    }

    animate(now) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = now;
        }
        const delta = now - this.lastTimestamp;
        this.lastTimestamp = now;
        const distance = (this.speed * delta) / 1000;
        this.scrollPosition += distance;
        if (this.scrollPosition >= this.segmentSize) {
            this.scrollPosition -= this.segmentSize;
        }
        this.applyScroll();
        if (this.isRunning && !this.isPaused) {
            this.animationFrame = requestAnimationFrame((ts) => this.animate(ts));
        }
    }
}

class ZhenshangyinNumberScroll {
    static INTERSECTION_THRESHOLD = 0.1;
    static EASE_COUNT_POWER = 3;
    static EASE_ROLL_POWER = 5;
    static DIGITS_PER_COLUMN = 20;
    static DIGIT_COUNT = 10;
    static ROLL_DURATION_FACTOR = 20;
    static DEFAULT_FONT_SIZE = 16;

    constructor(options = {}) {
        const className = options.className;
        if (typeof className !== 'string' || !className.trim()) {
            console.warn('[ZhenshangyinNumberScroll] className 必须为非空字符串');
            this.className = '';
            this.elements = [];
            this._observer = null;
            this._destroyed = true;
            return;
        }
        this.className = className.trim();
        this.duration = options.duration || 2000;
        this.effect = options.effect || 'count';
        this.rollCycles = Number.isFinite(options.rollCycles) ? options.rollCycles : 5;
        this.elements = [];
        this._observer = null;
        this._destroyed = false;
        this.init();
    }
    init() {
        if (this._destroyed) return;
        const collection = document.getElementsByClassName(this.className);
        if (!collection || collection.length === 0) {
            return;
        }
        this.elements = Array.prototype.slice.call(collection);
        this.bindScrollEvent();
    }
    bindScrollEvent() {
        if (this._destroyed) return;
        const threshold = ZhenshangyinNumberScroll.INTERSECTION_THRESHOLD;
        this._observer = new IntersectionObserver((entries) => {
            if (this._destroyed) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.scrollNumber(entry.target);
                    this._observer?.unobserve(entry.target);
                }
            });
        }, { threshold });

        this.elements.forEach(element => {
            const rawText = (element.textContent || '');
            const numberSpans = this._buildParts(element, rawText);
            if (numberSpans.length > 0) {
                this._observer.observe(element);
            }
        });
    }
    destroy() {
        this._destroyed = true;
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this.elements = [];
    }
    scrollNumber(element) {
        if (this.effect === 'roll') {
            this.scrollNumberRoll(element);
            return;
        }
        const spans = Array.from(element.querySelectorAll('.zhenshangyin-number-part'));
        const easePower = ZhenshangyinNumberScroll.EASE_COUNT_POWER;
        spans.forEach((span) => {
            const targetNumber = parseInt(span.getAttribute('data-target'), 10);
            const duration = this.duration;
            const startTime = performance.now();

            const animate = (currentTime) => {
                if (this._destroyed) return;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, easePower);
                const currentValue = Math.round(targetNumber * easeProgress);

                span.textContent = String(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    span.textContent = String(targetNumber);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    _buildParts(element, rawText) {
        element.setAttribute('data-raw', rawText);
        element.textContent = '';

        const spans = [];
        const re = /(\d+)|([^\d]+)/g;
        let m;
        while ((m = re.exec(rawText)) !== null) {
            if (m[1]) {
                const numStr = m[1];
                const num = parseInt(numStr, 10) || 0;
                const span = document.createElement('span');
                span.className = 'zhenshangyin-number-part';
                span.setAttribute('data-target', String(num));
                span.setAttribute('data-target-str', numStr);
                if (this.effect === 'roll') {
                    span.textContent = '';
                    this._ensureRoller(span, numStr.length);
                } else {
                    span.textContent = '0';
                }
                element.appendChild(span);
                spans.push(span);
            } else if (m[2]) {
                element.appendChild(document.createTextNode(m[2]));
            }
        }
        return spans;
    }

    _ensureRoller(element, length) {
        const existing = element.querySelector('.zhenshangyin-number-roll');
        if (existing && parseInt(existing.getAttribute('data-length'), 10) === length) {
            return;
        }
        if (existing) existing.remove();

        const wrap = document.createElement('span');
        wrap.className = 'zhenshangyin-number-roll';
        wrap.setAttribute('data-length', String(length));
        wrap.style.display = 'inline-flex';
        wrap.style.alignItems = 'flex-end';
        wrap.style.gap = '0';

        const digitsPerColumn = ZhenshangyinNumberScroll.DIGITS_PER_COLUMN;

        for (let i = 0; i < length; i++) {
            const digitBox = document.createElement('span');
            digitBox.className = 'zhenshangyin-number-roll-digit';
            digitBox.style.display = 'inline-block';
            digitBox.style.overflow = 'hidden';
            digitBox.style.verticalAlign = 'bottom';

            const digitInner = document.createElement('span');
            digitInner.className = 'zhenshangyin-number-roll-inner';
            digitInner.style.display = 'flex';
            digitInner.style.flexDirection = 'column';
            digitInner.style.willChange = 'transform';
            digitInner.style.transform = 'translateY(0px)';

            for (let k = 0; k < digitsPerColumn; k++) {
                const s = document.createElement('span');
                s.textContent = String(k % 10);
                s.style.display = 'block';
                digitInner.appendChild(s);
            }

            digitBox.appendChild(digitInner);
            wrap.appendChild(digitBox);
        }

        element.appendChild(wrap);
    }

    scrollNumberRoll(element) {
        const spans = Array.from(element.querySelectorAll('.zhenshangyin-number-part'));
        const { DIGIT_COUNT, ROLL_DURATION_FACTOR, EASE_ROLL_POWER, DEFAULT_FONT_SIZE } = ZhenshangyinNumberScroll;
        spans.forEach((span) => {
            const targetStr = span.getAttribute('data-target-str') || String(parseInt(span.getAttribute('data-target'), 10) || 0);
            this._ensureRoller(span, targetStr.length);

            const wrap = span.querySelector('.zhenshangyin-number-roll');
            if (!wrap) return;
            const digitBoxes = Array.from(wrap.querySelectorAll('.zhenshangyin-number-roll-digit'));
            const digitInners = Array.from(wrap.querySelectorAll('.zhenshangyin-number-roll-inner'));

            const firstSpan = digitInners[0]?.querySelector('span');
            let digitH = firstSpan ? firstSpan.getBoundingClientRect().height : 0;
            if (!digitH || digitH <= 0) {
                digitH = parseFloat(window.getComputedStyle(span).fontSize) || DEFAULT_FONT_SIZE;
            }
            digitBoxes.forEach((b) => {
                b.style.height = digitH + 'px';
            });

            const baseDuration = this.duration;
            const startTime = performance.now();

            const cycles = Math.max(0, this.rollCycles | 0);
            const baseCycle = cycles + 1;
            const randDirs = digitInners.map(() => (Math.random() < 0.5 ? -1 : 1));
            const startIndices = [];
            const endIndices = [];
            let maxSteps = 0;
            for (let i = 0; i < digitInners.length; i++) {
                const ch = targetStr[i] || '0';
                const t = parseInt(ch, 10) || 0;
                const dir = randDirs[i];
                const startIndex = dir === 1 ? (baseCycle * DIGIT_COUNT) : (baseCycle * DIGIT_COUNT + DIGIT_COUNT - 1);
                const endIndex = dir === 1
                    ? (startIndex + cycles * DIGIT_COUNT + t)
                    : (startIndex - cycles * DIGIT_COUNT - (DIGIT_COUNT - 1 - t));
                startIndices[i] = startIndex;
                endIndices[i] = endIndex;
                maxSteps = Math.max(maxSteps, Math.abs(endIndex - startIndex));
            }

            const duration = baseDuration * Math.max(1, maxSteps / ROLL_DURATION_FACTOR);
            const loopH = DIGIT_COUNT * digitH;

            const animate = (currentTime) => {
                if (this._destroyed) return;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, EASE_ROLL_POWER);

                for (let i = 0; i < digitInners.length; i++) {
                    const startIndex = startIndices[i];
                    const endIndex = endIndices[i];
                    const currentIndex = startIndex + (endIndex - startIndex) * easeProgress;
                    let offsetPx = -currentIndex * digitH;
                    offsetPx = offsetPx % loopH;
                    if (offsetPx > 0) offsetPx -= loopH;
                    digitInners[i].style.transform = `translateY(${offsetPx}px)`;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    for (let i = 0; i < digitInners.length; i++) {
                        const endIndex = endIndices[i];
                        let offsetPx = -endIndex * digitH;
                        offsetPx = offsetPx % loopH;
                        if (offsetPx > 0) offsetPx -= loopH;
                        digitInners[i].style.transform = `translateY(${offsetPx}px)`;
                    }
                }
            };

            requestAnimationFrame(animate);
        });
    }
}

class ZhenshangyinImageViewer {
    constructor(selector, options = {}) {
        this.options = {
            zoomRatio: 0.1, minZoom: 0.1, maxZoom: 5, showThumbnails: true,
            autoplayInterval: 3000,
            triggerSelector: null,
            openImageClass: null,
            itemSelector: null,
            itemTriggerSelector: null,
            ...options
        };

        this.rootContainers = this._getContainers(selector);
        if (!this.rootContainers.length) return;

        this.state = {
            containerImages: new Map(), currentContainer: null, currentIndex: 0,
            scale: 1, moveX: 0, moveY: 0, rotation: 0, isMoving: false, isPinching: false,
            isAutoPlaying: false, autoplayTimer: null, viewer: null, startX: 0, startY: 0,
            initialDistance: 0, initialPinchScale: 1, moveRAF: null, switchTimer: null
        };

        this._init();
    }

    _getContainers(selector) {
        if (typeof selector === 'string') return Array.from(document.querySelectorAll(selector));
        if (selector instanceof Element) return [selector];
        if (Array.isArray(selector)) return selector;
        return [];
    }

    _init() {
        this.rootContainers.forEach(container => {
            container.addEventListener('click', (e) => {
                const img = e.target.closest(this._imageSelector());
                if (img) {
                    this.state.currentContainer = container;
                    const currentImages = Array.from(container.querySelectorAll(this._imageSelector()));
                    const index = currentImages.indexOf(img);
                    this.show(index);
                }
            });

            this._updateContainerImages(container);

            if (this.options.itemSelector && this.options.itemTriggerSelector) {
                const items = container.querySelectorAll(this.options.itemSelector);
                const currentImages = Array.from(container.querySelectorAll(this._imageSelector()));
                items.forEach(item => {
                    const img = item.querySelector(this._imageSelector());
                    if (!img) return;
                    const index = currentImages.indexOf(img);
                    if (index === -1) return;
                    const triggers = item.querySelectorAll(this.options.itemTriggerSelector);
                    triggers.forEach(trigger => {
                        trigger.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.state.currentContainer = container;
                            this.show(index);
                        });
                    });
                });
            }
        });

        if (this.options.triggerSelector) {
            const triggers = document.querySelectorAll(this.options.triggerSelector);
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    if (!this.rootContainers.length) return;
                    const container = this.rootContainers[0];
                    this.state.currentContainer = container;
                    const currentImages = this.state.containerImages.get(container);
                    if (currentImages && currentImages.length) {
                        this.show(0);
                    }
                });
            });
        }
    }

    _updateContainerImages(container) {
        const images = Array.from(container.querySelectorAll(this._imageSelector()));
        this.state.containerImages.set(container, images);
    }

    _imageSelector() {
        const raw = this.options.openImageClass;
        if (!raw) return 'img';
        const classNames = String(raw)
            .trim()
            .replace(/^\./, '')
            .split(/\s+/)
            .filter(Boolean);
        if (!classNames.length) return 'img';
        return `img.${classNames.join('.')}`;
    }

    createViewer() {
        const icons = {
            prev: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
            rotateLeft: 'M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z',
            rotateRight: 'M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z',
            reset: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
            play: 'M8 5v14l11-7z',
            pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
            zoomIn: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
            zoomOut: 'M19 13H5v-2h14v2z',
            close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
            next: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'
        };

        const createButton = (className, iconPath, extraContent = '') =>
            `<button class="${className}"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="${iconPath}"/></svg>${extraContent}</button>`;

        this.state.viewer = document.createElement('div');
        this.state.viewer.className = 'zhenshangyin-image-viewer';
        this.state.viewer.innerHTML = `
            <div class="zhenshangyin-viewer-mask"></div>
            <div class="zhenshangyin-viewer-container">
                <div class="zhenshangyin-viewer-canvas"></div>
                <div class="zhenshangyin-viewer-footer">
                    <div class="zhenshangyin-viewer-footer-top">
                        <div class="zhenshangyin-viewer-thumbnails"></div>
                    </div>
                    <div class="zhenshangyin-viewer-toolbar">
                        ${createButton('zhenshangyin-viewer-prev', icons.prev)}
                        ${createButton('zhenshangyin-viewer-rotate-left', icons.rotateLeft)}
                        ${createButton('zhenshangyin-viewer-rotate-right', icons.rotateRight)}
                        ${createButton('zhenshangyin-viewer-reset', icons.reset)}
                        ${createButton('zhenshangyin-viewer-autoplay', icons.play,
            `<svg viewBox="0 0 24 24" width="20" height="20" class="pause-icon" style="display:none"><path fill="currentColor" d="${icons.pause}"/></svg>`)}
                        ${createButton('zhenshangyin-viewer-zoom-in', icons.zoomIn)}
                        ${createButton('zhenshangyin-viewer-zoom-out', icons.zoomOut)}
                        ${createButton('zhenshangyin-viewer-close', icons.close)}
                        ${createButton('zhenshangyin-viewer-next', icons.next)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.state.viewer);
        this._cacheElements();
        this.options.showThumbnails ? this.createThumbnails() : this.state.thumbnailsContainer.style.display = 'none';
    }

    _cacheElements() {
        const elements = {
            mask: '.zhenshangyin-viewer-mask',
            container: '.zhenshangyin-viewer-container',
            canvas: '.zhenshangyin-viewer-canvas',
            toolbar: '.zhenshangyin-viewer-toolbar',
            thumbnailsContainer: '.zhenshangyin-viewer-thumbnails'
        };

        Object.entries(elements).forEach(([key, selector]) => {
            this.state[key] = this.state.viewer.querySelector(selector);
        });
    }

    createThumbnails() {
        if (!this.state.thumbnailsContainer) return;

        const currentImages = this.state.containerImages.get(this.state.currentContainer);
        if (!currentImages || !currentImages.length) return;

        const uniqueImages = new Map();

        currentImages.forEach((img, index) => {
            if (!uniqueImages.has(img.src)) uniqueImages.set(img.src, [index]);
            else uniqueImages.get(img.src).push(index);
        });

        this.state.thumbnailsContainer.innerHTML = '';
        uniqueImages.forEach((indices, src) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'zhenshangyin-viewer-thumbnail';
            if (indices.includes(this.state.currentIndex)) thumbnail.classList.add('active');
            thumbnail.src = src;
            thumbnail.alt = currentImages[indices[0]].alt;
            thumbnail.draggable = false;
            thumbnail.addEventListener('click', (e) => {
                const container = this.state.thumbnailsContainer;
                if (container) {
                    const lastDragEnd = Number(container._zhenshangyinLastDragEnd || 0);
                    if (Date.now() - lastDragEnd < 200) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                this._handleThumbnailClick(indices);
            });
            this.state.thumbnailsContainer.appendChild(thumbnail);
        });

        this._bindThumbnailDragScroll();
    }

    _bindThumbnailDragScroll() {
        const container = this.state.thumbnailsContainer;
        if (!container || container._zhenshangyinDragBound) return;

        container._zhenshangyinDragBound = true;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let hasMoved = false;

        const onMouseDown = (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
            isDown = true;
            hasMoved = false;
            startX = e.pageX - container.getBoundingClientRect().left;
            scrollLeft = container.scrollLeft;
            container.classList.add('is-dragging');
        };

        const onMouseLeaveOrUp = () => {
            isDown = false;
            if (hasMoved) {
                container._zhenshangyinDragMoved = true;
                container._zhenshangyinLastDragEnd = Date.now();
            }
            container.classList.remove('is-dragging');
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.getBoundingClientRect().left;
            const walk = x - startX;
            if (Math.abs(walk) > 3) {
                hasMoved = true;
            }
            container.scrollLeft = scrollLeft - walk;
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mouseleave', onMouseLeaveOrUp);
        container.addEventListener('mouseup', onMouseLeaveOrUp);
        container.addEventListener('mousemove', onMouseMove);

        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchHasMoved = false;

        const onTouchStart = (e) => {
            if (!e.touches || !e.touches.length) return;
            const touch = e.touches[0];
            touchStartX = touch.pageX - container.getBoundingClientRect().left;
            touchScrollLeft = container.scrollLeft;
            container.classList.add('is-dragging');
            touchHasMoved = false;
        };

        const onTouchMove = (e) => {
            if (!e.touches || !e.touches.length) return;
            const touch = e.touches[0];
            const x = touch.pageX - container.getBoundingClientRect().left;
            const walk = x - touchStartX;
            if (Math.abs(walk) > 5) {
                e.preventDefault();
                touchHasMoved = true;
            }
            container.scrollLeft = touchScrollLeft - walk;
        };

        const onTouchEnd = () => {
            if (touchHasMoved) {
                container._zhenshangyinDragMoved = true;
                container._zhenshangyinLastDragEnd = Date.now();
            }
            container.classList.remove('is-dragging');
        };

        container.addEventListener('touchstart', onTouchStart, { passive: false });
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        container.addEventListener('touchend', onTouchEnd);
        container.addEventListener('touchcancel', onTouchEnd);
    }

    _handleThumbnailClick(indices) {
        const currentIndex = this.state.currentIndex;
        const currentImages = this.state.containerImages.get(this.state.currentContainer);
        if (!currentImages) return;

        let nextIndex = indices[0];
        const currentIndexInGroup = indices.indexOf(currentIndex);
        if (currentIndexInGroup !== -1 && currentIndexInGroup < indices.length - 1) {
            nextIndex = indices[currentIndexInGroup + 1];
        }
        if (nextIndex !== currentIndex) {
            this.state.thumbnailsContainer.querySelectorAll('.zhenshangyin-viewer-thumbnail').forEach(thumb => thumb.classList.remove('active'));
            const thumbnailElements = this.state.thumbnailsContainer.querySelectorAll('.zhenshangyin-viewer-thumbnail');
            const targetIndex = Array.from(thumbnailElements).findIndex(thumb => thumb.src === currentImages[nextIndex].src);
            if (targetIndex !== -1) {
                thumbnailElements[targetIndex].classList.add('active');
            }
            this.show(nextIndex);
        }
    }

    bindEvents() {
        const actions = {
            'zhenshangyin-viewer-zoom-in': () => this.zoom(this.state.scale + this.options.zoomRatio),
            'zhenshangyin-viewer-zoom-out': () => this.zoom(this.state.scale - this.options.zoomRatio),
            'zhenshangyin-viewer-rotate-left': () => this.rotate(-90),
            'zhenshangyin-viewer-rotate-right': () => this.rotate(90),
            'zhenshangyin-viewer-close': () => this.hide(),
            'zhenshangyin-viewer-autoplay': () => this.toggleAutoplay(),
            'zhenshangyin-viewer-reset': () => this.resetCurrentImage()
        };

        if (this.state.toolbar) {
            this.state.toolbar.addEventListener('click', e => {
                const target = e.target.closest('button');
                if (!target) return;
                Object.entries(actions).forEach(([className, action]) => {
                    if (target.classList.contains(className)) action();
                });
            });
        }

        ['prev', 'next'].forEach(action => {
            const button = this.state.viewer.querySelector(`.zhenshangyin-viewer-${action}`);
            if (button) {
                button.addEventListener('click', () => this[action]());
            }
        });

        if (this.state.mask) {
            this.state.mask.addEventListener('click', () => this.hide());
        }
        if (this.state.canvas) {
            this.state.canvas.addEventListener('click', e => e.target === this.state.canvas && this.hide());
        }

        if (this.state.canvas) {
            this.state.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
            document.addEventListener('mousemove', this.onMouseMove.bind(this));
            document.addEventListener('mouseup', this.onMouseUp.bind(this));
            this.state.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
        }

        if (this.state.canvas) {
            ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(event => {
                const methodName = `onTouch${event.slice(5)}`;
                if (this[methodName]) {
                    this.state.canvas.addEventListener(event, this[methodName].bind(this), { passive: false });
                }
            });
        }

        document.addEventListener('keydown', e => {
            const keyActions = { Escape: () => this.hide(), ArrowLeft: () => this.prev(), ArrowRight: () => this.next() };
            keyActions[e.key]?.();
        });

        if (this.state.canvas) {
            this.state.canvas.addEventListener('wheel', e => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -1 : 1;
                this.zoom(this.state.scale + (delta * this.options.zoomRatio));
            });
        }

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) this.stopAutoplay();
        });
    }

    show(index) {
        this.state.currentIndex = index;
        if (!this.state.viewer) {
            this.createViewer();
            this.bindEvents();
        }

        this._updateContainerImages(this.state.currentContainer);
        const currentImages = this.state.containerImages.get(this.state.currentContainer);

        if (this.state.isAutoPlaying) {
            clearInterval(this.state.autoplayTimer);
            this.state.autoplayTimer = setInterval(() => {
                this.state.currentIndex < currentImages.length - 1 ? this.next() : this.show(0);
            }, this.options.autoplayInterval);
        }

        this.state.viewer.style.display = 'block';
        this.state.viewer.offsetHeight;
        this.state.viewer.classList.add('show');
        this.loadImage(currentImages[index].src);

        if (this.options.showThumbnails) {
            this.createThumbnails();
        }
    }

    _updateThumbnails(currentImageSrc) {
        if (!this.options.showThumbnails) return;
        const thumbnails = this.state.thumbnailsContainer.querySelectorAll('.zhenshangyin-viewer-thumbnail');
        thumbnails.forEach(thumb => {
            if (thumb.src === currentImageSrc) {
                thumb.classList.add('active');
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    hide() {
        if (!this.state.viewer) return;
        this.state.viewer.classList.remove('show');
        setTimeout(() => {
            if (this.state.isAutoPlaying) this.stopAutoplay();
            this.reset();
            this.state.viewer.remove();
            this.state.viewer = null;
        }, 300);
    }

    reset() {
        Object.assign(this.state, { scale: 1, moveX: 0, moveY: 0, rotation: 0 });
    }

    loadImage(src) {
        if (this.state.switchTimer) {
            clearTimeout(this.state.switchTimer);
            this.state.switchTimer = null;
        }
        this.reset();
        this.state.canvas.querySelectorAll('img.slide-exit, img.slide-exit-active, img.slide-enter, img.slide-enter-active').forEach(img => img.remove());

        const img = new Image();
        img.src = src;
        img.onload = () => {
            while (this.state.canvas.firstChild) this.state.canvas.firstChild.remove();
            img.classList.add('slide-enter');
            img.style.cursor = 'grab';
            this.state.canvas.appendChild(img);
            img.offsetHeight;
            img.classList.add('slide-enter-active');
            this.state.switchTimer = setTimeout(() => img.classList.remove('slide-enter', 'slide-enter-active'), 300);
            this.updateImageTransform();
        };
    }

    updateImageTransform() {
        const img = this.state.canvas.querySelector('img');
        if (img) {
            img.style.transition = (this.state.isMoving || this.state.isPinching) ? 'none' : 'transform 0.3s ease';
            img.style.transform = `translate3d(-50%, -50%, 0) translate3d(${this.state.moveX}px, ${this.state.moveY}px, 0) scale(${this.state.scale}) rotate(${this.state.rotation || 0}deg)`;
        }
    }

    zoom(scale) {
        this.state.scale = Math.min(Math.max(scale, this.options.minZoom), this.options.maxZoom);
        this.updateImageTransform();
    }

    rotate(degree) {
        this.state.rotation = (this.state.rotation || 0) + degree;
        this.updateImageTransform();
    }

    prev() {
        const currentImages = this.state.containerImages.get(this.state.currentContainer);
        this.show(this.state.currentIndex > 0 ? this.state.currentIndex - 1 : currentImages.length - 1);
    }

    next() {
        const currentImages = this.state.containerImages.get(this.state.currentContainer);
        this.show(this.state.currentIndex < currentImages.length - 1 ? this.state.currentIndex + 1 : 0);
    }

    onMouseDown(e) {
        const img = e.target.closest('img') || this.state.canvas.querySelector('img');
        if (!img || !this.state.canvas.contains(img)) return;
        e.preventDefault();
        this.state.isMoving = true;
        this.state.startX = e.clientX - this.state.moveX;
        this.state.startY = e.clientY - this.state.moveY;
        img.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.state.isMoving) return;
        if (this.state.moveRAF) cancelAnimationFrame(this.state.moveRAF);
        this.state.moveRAF = requestAnimationFrame(() => {
            this.state.moveX = e.clientX - this.state.startX;
            this.state.moveY = e.clientY - this.state.startY;
            this.updateImageTransform();
        });
    }

    onMouseUp() {
        if (!this.state.isMoving) return;
        this.state.isMoving = false;
        const img = this.state.canvas.querySelector('img');
        if (img) img.style.cursor = 'grab';
        if (this.state.moveRAF) {
            cancelAnimationFrame(this.state.moveRAF);
            this.state.moveRAF = null;
        }
    }

    toggleAutoplay() {
        const autoplayBtn = this.state.toolbar.querySelector('.zhenshangyin-viewer-autoplay');
        const [playIcon, pauseIcon] = autoplayBtn.querySelectorAll('svg');
        if (this.state.isAutoPlaying) {
            this.stopAutoplay();
            [playIcon.style.display, pauseIcon.style.display] = ['', 'none'];
        } else {
            this.startAutoplay();
            [playIcon.style.display, pauseIcon.style.display] = ['none', ''];
        }
    }

    startAutoplay() {
        if (!this.state.isAutoPlaying) {
            this.state.isAutoPlaying = true;
            this.resetCurrentImage();
            if (this.state.viewer && document.fullscreenEnabled && !document.fullscreenElement) {
                this.state.viewer.classList.add('fullscreen');
            }
            this.state.autoplayTimer = setInterval(() => {
                const currentImages = this.state.containerImages.get(this.state.currentContainer);
                this.state.currentIndex < currentImages.length - 1 ? this.next() : this.show(0);
            }, this.options.autoplayInterval);
        }
    }

    stopAutoplay() {
        if (this.state.isAutoPlaying) {
            this.state.isAutoPlaying = false;
            clearInterval(this.state.autoplayTimer);
            this.state.autoplayTimer = null;
            if (this.state.viewer) {
                const autoplayBtn = this.state.viewer.querySelector('.zhenshangyin-viewer-autoplay');
                const [playIcon, pauseIcon] = autoplayBtn.querySelectorAll('svg');
                [playIcon.style.display, pauseIcon.style.display] = ['', 'none'];
                this.state.viewer.classList.remove('fullscreen');
            }
        }
    }

    resetCurrentImage() {
        this.reset();
        this.updateImageTransform();
    }

    getDistance(touches) {
        const [touch1, touch2] = touches;
        return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
    }

    onTouchStart(e) {
        const img = e.target.closest('img') || this.state.canvas.querySelector('img');
        if (!img || !this.state.canvas.contains(img)) return;
        e.preventDefault();
        const touches = e.touches;
        if (touches.length === 1) {
            this.state.isMoving = true;
            this.state.startX = touches[0].clientX - this.state.moveX;
            this.state.startY = touches[0].clientY - this.state.moveY;
            img.style.transition = 'none';
        } else if (touches.length === 2) {
            this.state.isMoving = false;
            this.state.isPinching = true;
            this.state.initialDistance = this.getDistance(touches);
            this.state.initialPinchScale = this.state.scale;
        }
    }

    onTouchMove(e) {
        if (!this.state.isMoving && !this.state.isPinching) return;
        e.preventDefault();
        if (this.state.moveRAF) cancelAnimationFrame(this.state.moveRAF);
        this.state.moveRAF = requestAnimationFrame(() => {
            const touches = e.touches;
            if (this.state.isPinching && touches.length === 2) {
                const newDistance = this.getDistance(touches);
                const scaleRatio = newDistance / this.state.initialDistance;
                this.zoom(this.state.initialPinchScale * scaleRatio);
            } else if (this.state.isMoving && touches.length === 1) {
                this.state.moveX = touches[0].clientX - this.state.startX;
                this.state.moveY = touches[0].clientY - this.state.startY;
                this.updateImageTransform();
            }
        });
    }

    onTouchEnd(e) {
        if (e.touches.length === 0) {
            this.state.isMoving = false;
            this.state.isPinching = false;
            const img = this.state.canvas.querySelector('img');
            if (img) img.style.transition = 'transform 0.3s ease';
        } else if (e.touches.length === 1 && this.state.isPinching) {
            this.state.isPinching = false;
            this.state.isMoving = true;
            this.state.startX = e.touches[0].clientX - this.state.moveX;
            this.state.startY = e.touches[0].clientY - this.state.moveY;
        }
    }
}

class ZhenshangyinAnimate {
    static instances = new WeakMap();
    constructor(element, selector = null) {
        if (!element) {
            return {
                fadeIn: () => this,
                fadeOut: () => this,
                fadeToggle: () => this,
                slideDown: () => this,
                slideUp: () => this,
                slideToggle: () => this
            };
        }
        if (!(this instanceof ZhenshangyinAnimate)) {
            return ZhenshangyinAnimate.getInstance(element);
        }
        this.element = element;
        this.selector = selector;
        this.isAnimating = false;
        this.animationDirection = null;
        this.targetHeight = null;
        this.lastHeight = null;
        this.originalStyles = null;
        this.currentFrame = null;
    }
    static getInstance(element) {
        if (typeof element === 'string') {
            const selector = element;
            element = document.querySelector(selector);
            if (!element) {
                return new ZhenshangyinAnimate(null);
            }

            if (!this.instances.has(element)) {
                const instance = new ZhenshangyinAnimate(element, selector);
                this.instances.set(element, instance);
            }
            return this.instances.get(element);
        }

        if (!element) {
            return new ZhenshangyinAnimate(null);
        }

        if (!this.instances.has(element)) {
            const instance = new ZhenshangyinAnimate(element);
            this.instances.set(element, instance);
        }
        return this.instances.get(element);
    }
    animate(properties, duration = 300, complete) {
        if (!this.element) return this;

        this.stop();
        this.isAnimating = true;
        const startTime = performance.now();
        const initialStyles = {};
        const targetStyles = {};
        for (const prop in properties) {
            const computedStyle = window.getComputedStyle(this.element);
            initialStyles[prop] = parseFloat(computedStyle[prop]) || 0;
            targetStyles[prop] = parseFloat(properties[prop]);
        }

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            for (const prop in targetStyles) {
                const initial = initialStyles[prop];
                const target = targetStyles[prop];
                const current = initial + (target - initial) * progress;

                if (prop === 'opacity') {
                    this.element.style[prop] = current.toFixed(3);
                } else {
                    this.element.style[prop] = `${Math.round(current)}px`;
                }
            }

            if (progress < 1) {
                this.currentFrame = requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.animationDirection = null;
                if (complete) complete.call(this.element);
            }
        };

        this.currentFrame = requestAnimationFrame(animate);
        return this;
    }

    stop() {
        if (this.currentFrame) {
            cancelAnimationFrame(this.currentFrame);
            this.currentFrame = null;
        }
        this.isAnimating = false;
        return this;
    }

    fadeIn(duration = 300, complete) {
        const element = this.element;
        const computedStyle = window.getComputedStyle(element);

        if (computedStyle.display !== 'none' && parseFloat(computedStyle.opacity) === 1) {
            if (complete) complete.call(element);
            return this;
        }

        this.animationDirection = 'in';
        element.style.opacity = '0';
        element.style.display = 'block';

        return this.animate(
            { opacity: 1 },
            duration,
            () => {
                element.style.removeProperty('opacity');
                if (complete) complete.call(element);
            }
        );
    }

    fadeOut(duration = 300, complete) {
        const element = this.element;
        const computedStyle = window.getComputedStyle(element);

        if (computedStyle.display === 'none') {
            if (complete) complete.call(element);
            return this;
        }

        this.animationDirection = 'out';

        return this.animate(
            { opacity: 0 },
            duration,
            () => {
                element.style.display = 'none';
                element.style.removeProperty('opacity');
                if (complete) complete.call(element);
            }
        );
    }

    fadeToggle(duration = 300, complete) {
        const computedStyle = window.getComputedStyle(this.element);
        const isHidden = computedStyle.display === 'none';
        const opacity = parseFloat(computedStyle.opacity);
        const isFullyTransparent = opacity === 0;

        if (this.isAnimating) {
            if (this.animationDirection === 'in') {
                return this.fadeOut(duration, complete);
            } else if (this.animationDirection === 'out') {
                return this.fadeIn(duration, complete);
            }
        }

        if (isHidden || isFullyTransparent) {
            return this.fadeIn(duration, complete);
        } else {
            return this.fadeOut(duration, complete);
        }
    }

    slideDown(duration = 300, complete) {
        const element = this.element;
        if (!element) return this;

        const computedStyle = window.getComputedStyle(element);
        const boxSizing = computedStyle.boxSizing;

        if (computedStyle.display !== 'none' && !this.isAnimating && !this.lastHeight) {
            if (complete) complete.call(element);
            return this;
        }

        this.animationDirection = 'down';
        if (!this.originalStyles) {
            this.originalStyles = {
                paddingTop: parseFloat(computedStyle.paddingTop) || 0,
                paddingBottom: parseFloat(computedStyle.paddingBottom) || 0,
                marginTop: parseFloat(computedStyle.marginTop) || 0,
                marginBottom: parseFloat(computedStyle.marginBottom) || 0,
                borderTopWidth: parseFloat(computedStyle.borderTopWidth) || 0,
                borderBottomWidth: parseFloat(computedStyle.borderBottomWidth) || 0,
                opacity: parseFloat(computedStyle.opacity) || 1
            };
        }

        if (!this.targetHeight) {
            if (this.lastHeight) {
                this.targetHeight = this.lastHeight;
            } else {
                const tempDisplay = element.style.display;
                const tempHeight = element.style.height;
                const tempVisibility = element.style.visibility;
                const tempPadding = element.style.padding;
                const tempMargin = element.style.margin;
                const tempBorder = element.style.border;

                element.style.display = 'block';
                element.style.height = '';
                element.style.visibility = 'hidden';
                element.style.padding = '0px';
                element.style.margin = '0px';
                element.style.border = 'none';

                const contentHeight = element.offsetHeight;

                element.style.display = tempDisplay;
                element.style.height = tempHeight;
                element.style.visibility = tempVisibility;
                element.style.padding = tempPadding;
                element.style.margin = tempMargin;
                element.style.border = tempBorder;

                this.targetHeight = boxSizing === 'border-box'
                    ? contentHeight + this.originalStyles.paddingTop + this.originalStyles.paddingBottom +
                    this.originalStyles.borderTopWidth + this.originalStyles.borderBottomWidth
                    : contentHeight;
            }
        }

        element.style.display = 'block';
        element.style.height = '0';
        element.style.paddingTop = '0';
        element.style.paddingBottom = '0';
        element.style.marginTop = '0';
        element.style.marginBottom = '0';
        element.style.overflow = 'hidden';
        element.style.boxSizing = boxSizing;

        return this.animate(
            {
                height: this.targetHeight,
                paddingTop: this.originalStyles.paddingTop,
                paddingBottom: this.originalStyles.paddingBottom,
                marginTop: this.originalStyles.marginTop,
                marginBottom: this.originalStyles.marginBottom,
                opacity: this.originalStyles.opacity
            },
            duration,
            () => {
                element.style.removeProperty('height');
                element.style.removeProperty('padding-top');
                element.style.removeProperty('padding-bottom');
                element.style.removeProperty('margin-top');
                element.style.removeProperty('margin-bottom');
                element.style.removeProperty('overflow');
                element.style.removeProperty('opacity');
                element.style.removeProperty('box-sizing');
                this.targetHeight = null;
                if (complete) complete.call(element);
            }
        );
    }

    slideUp(duration = 300, complete) {
        const element = this.element;
        if (!element) return this;

        const computedStyle = window.getComputedStyle(element);
        const boxSizing = computedStyle.boxSizing;

        if (computedStyle.display === 'none' && !this.isAnimating && !this.lastHeight) {
            if (complete) complete.call(element);
            return this;
        }

        this.animationDirection = 'up';

        if (!this.lastHeight && !this.isAnimating) {
            const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
            const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
            const borderTopWidth = parseFloat(computedStyle.borderTopWidth) || 0;
            const borderBottomWidth = parseFloat(computedStyle.borderBottomWidth) || 0;

            this.lastHeight = boxSizing === 'border-box'
                ? element.offsetHeight
                : element.offsetHeight - paddingTop - paddingBottom - borderTopWidth - borderBottomWidth;
        }

        const currentHeight = element.offsetHeight;

        element.style.height = `${currentHeight}px`;
        element.style.overflow = 'hidden';
        element.style.boxSizing = boxSizing;

        return this.animate(
            {
                height: 0,
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 0,
                marginBottom: 0
            },
            duration,
            () => {
                element.style.display = 'none';
                element.style.removeProperty('height');
                element.style.removeProperty('padding-top');
                element.style.removeProperty('padding-bottom');
                element.style.removeProperty('margin-top');
                element.style.removeProperty('margin-bottom');
                element.style.removeProperty('overflow');
                element.style.removeProperty('box-sizing');
                if (complete) complete.call(element);
            }
        );
    }

    slideToggle(duration = 300, complete) {
        if (!this.element) return this;

        const computedStyle = window.getComputedStyle(this.element);
        const isHidden = computedStyle.display === 'none';

        if (this.isAnimating) {
            if (this.animationDirection === 'down') {
                return this.slideUp(duration, complete);
            } else if (this.animationDirection === 'up') {
                return this.slideDown(duration, complete);
            }
        }

        if (this.lastHeight && isHidden) {
            return this.slideDown(duration, complete);
        }

        return isHidden ? this.slideDown(duration, complete) : this.slideUp(duration, complete);
    }

    isVisible() {
        if (!this.element) return false;

        const computedStyle = window.getComputedStyle(this.element);
        const isHidden = computedStyle.display === 'none';
        const opacity = parseFloat(computedStyle.opacity) || 1;
        const height = parseFloat(computedStyle.height) || this.element.offsetHeight;

        return !isHidden && opacity > 0 && height > 0;
    }
}

class ZhenshangyinTextEffect {
    constructor(selector, options = {}) {
        this.element = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!this.element) {
            return;
        }

        this.threshold = options.threshold || 50;
        this.repeat = options.repeat || false;
        this.mobile = options.mobile || false;
        this.overlap = options.overlap !== undefined ? Math.max(0, Math.min(1, options.overlap)) : 0.1;
        this.duration = options.duration || 500;
        this.random = options.random || false;
        this.effects = options.effects ? (Array.isArray(options.effects) ? options.effects : [options.effects]) : null;

        if (this.isMobile() && !this.mobile) {
            return;
        }

        this.animated = false;
        this.entrySide = null;
        this._rafId = null;
        this._scrolling = false;
        this._scrollStopTimer = null;
        this._onScroll = this.onScroll.bind(this);
        this._onScrollThrottled = this.onScrollThrottled.bind(this);
        this._effectsActive = false;
        this._fromTransform = null;
        this._toTransform = null;
        this._fromStyles = {};
        this._toStyles = {};
        this._seqT = {};
        this._seqS = {};

        this._ticking = false;
        this._observer = null;
        this._activeTimeoutIds = new Set();
        this._spanTimeoutIds = new WeakMap();
        this._destroyed = false;
        this._originalOverflow = this.element.style.overflow;
        this._originalHTML = this.element.innerHTML;

        this.charSpans = [];

        this.element.style.overflow = 'hidden';
        this.initEffects();
        this.splitText();
        this.initObserver();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (window.innerWidth <= 768 && 'ontouchstart' in window);
    }

    initEffects() {
        if (!this.effects || this.effects.length === 0) {
            this._effectsActive = false;
            this._fromTransform = null;
            this._toTransform = null;
            this._fromStyles = {};
            this._toStyles = {};
            return;
        }

        const order = ['translateX', 'translateY', 'skewX', 'skewY', 'scale', 'rotate'];
        const fromT = { translateX: null, translateY: null, skewX: null, skewY: null, scale: null, rotate: null };
        const toT = { translateX: null, translateY: null, skewX: null, skewY: null, scale: null, rotate: null };
        const fromS = {};
        const toS = {};
        this._seqT = {};
        this._seqS = {};

        this.effects.forEach(group => {
            if (!group || typeof group !== 'object') return;
            if (group.translateX && Array.isArray(group.translateX) && group.translateX.length >= 2) {
                const arr = group.translateX.map(v => this.normalizeTranslate(v));
                fromT.translateX = arr[0];
                toT.translateX = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.translateX = arr;
            }
            if (group.translateY && Array.isArray(group.translateY) && group.translateY.length >= 2) {
                const arr = group.translateY.map(v => this.normalizeTranslate(v));
                fromT.translateY = arr[0];
                toT.translateY = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.translateY = arr;
            }
            if (group.skewX && Array.isArray(group.skewX) && group.skewX.length >= 2) {
                const arr = group.skewX.map(v => this.normalizeSkew(v));
                fromT.skewX = arr[0];
                toT.skewX = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.skewX = arr;
            }
            if (group.skewY && Array.isArray(group.skewY) && group.skewY.length >= 2) {
                const arr = group.skewY.map(v => this.normalizeSkew(v));
                fromT.skewY = arr[0];
                toT.skewY = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.skewY = arr;
            }
            if (group.scale && Array.isArray(group.scale) && group.scale.length >= 2) {
                const arr = group.scale.map(v => this.normalizeScale(v));
                fromT.scale = arr[0];
                toT.scale = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.scale = arr;
            }
            if (group.rotate && Array.isArray(group.rotate) && group.rotate.length >= 2) {
                const arr = group.rotate.map(v => this.normalizeRotate(v));
                fromT.rotate = arr[0];
                toT.rotate = arr[arr.length - 1];
                if (arr.length > 2) this._seqT.rotate = arr;
            }
            if (group.opacity && Array.isArray(group.opacity) && group.opacity.length >= 2) {
                const arr = group.opacity.map(v => this.normalizeOpacity(v));
                fromS.opacity = arr[0];
                toS.opacity = arr[arr.length - 1];
                if (arr.length > 2) this._seqS.opacity = arr;
            }
            if (group.color && Array.isArray(group.color) && group.color.length >= 2) {
                const arr = group.color.map(v => String(v));
                fromS.color = arr[0];
                toS.color = arr[arr.length - 1];
                if (arr.length > 2) this._seqS.color = arr;
            }
            if (group.fontSize && Array.isArray(group.fontSize) && group.fontSize.length >= 2) {
                const arr = group.fontSize.map(v => this.normalizePx(v));
                fromS.fontSize = arr[0];
                toS.fontSize = arr[arr.length - 1];
                if (arr.length > 2) this._seqS.fontSize = arr;
            }
            if (group.letterSpacing && Array.isArray(group.letterSpacing) && group.letterSpacing.length >= 2) {
                const arr = group.letterSpacing.map(v => this.normalizePx(v));
                fromS.letterSpacing = arr[0];
                toS.letterSpacing = arr[arr.length - 1];
                if (arr.length > 2) this._seqS.letterSpacing = arr;
            }
        });

        const fromParts = [];
        const toParts = [];
        order.forEach(k => {
            if (fromT[k] !== null) {
                if (k === 'translateX') fromParts.push(`translateX(${fromT[k]})`);
                if (k === 'translateY') fromParts.push(`translateY(${fromT[k]})`);
                if (k === 'skewX') fromParts.push(`skewX(${fromT[k]})`);
                if (k === 'skewY') fromParts.push(`skewY(${fromT[k]})`);
                if (k === 'scale') fromParts.push(`scale(${fromT[k]})`);
                if (k === 'rotate') fromParts.push(`rotate(${fromT[k]})`);
            }
            if (toT[k] !== null) {
                if (k === 'translateX') toParts.push(`translateX(${toT[k]})`);
                if (k === 'translateY') toParts.push(`translateY(${toT[k]})`);
                if (k === 'skewX') toParts.push(`skewX(${toT[k]})`);
                if (k === 'skewY') toParts.push(`skewY(${toT[k]})`);
                if (k === 'scale') toParts.push(`scale(${toT[k]})`);
                if (k === 'rotate') toParts.push(`rotate(${toT[k]})`);
            }
        });

        this._fromTransform = fromParts.length ? fromParts.join(' ') : null;
        this._toTransform = toParts.length ? toParts.join(' ') : null;
        this._fromStyles = fromS;
        this._toStyles = toS;
        this._effectsActive = Boolean(this._fromTransform || this._toTransform || Object.keys(fromS).length || Object.keys(toS).length);
        this._order = order;
    }

    normalizeTranslate(v) {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return `${v}px`;
        const s = String(v).trim();
        return s;
    }

    normalizePx(v) {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return `${v}px`;
        const s = String(v).trim();
        return s;
    }

    normalizeScale(v) {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return String(v);
        const s = String(v).trim();
        return s;
    }

    normalizeRotate(v) {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return `${v}deg`;
        const s = String(v).trim();
        return s;
    }

    normalizeSkew(v) {
        if (v === null || v === undefined) return null;
        if (typeof v === 'number') return `${v}deg`;
        const s = String(v).trim();
        return s;
    }

    normalizeOpacity(v) {
        if (v === null || v === undefined) return undefined;
        const n = typeof v === 'number' ? v : parseFloat(v);
        if (isNaN(n)) return undefined;
        const clamped = Math.max(0, Math.min(1, n));
        return clamped;
    }

    splitText() {
        this.processNode(this.element);
    }

    processNode(node) {
        const childNodes = Array.from(node.childNodes);

        childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent;
                if (!text) {
                    return;
                }

                const chars = text.split('');
                const fragment = document.createDocumentFragment();

                chars.forEach((char) => {
                    const span = document.createElement('span');
                    if (char === ' ') {
                        span.textContent = '\u00A0';
                    } else if (char === '\n' || char === '\r' || char === '\t') {
                        span.textContent = char === '\t' ? '\u00A0\u00A0\u00A0\u00A0' : '\u00A0';
                        span.style.whiteSpace = 'pre';
                    } else {
                        span.textContent = char;
                    }

                    span.style.display = 'inline-block';
                    span.style.position = 'relative';
                    span.className = 'text-effect-char';
                    this.setInitialState(span);
                    fragment.appendChild(span);
                    this.charSpans.push(span);
                });

                node.replaceChild(fragment, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName ? child.tagName.toLowerCase() : '';
                if (tagName === 'br' || tagName === 'hr' || tagName === 'img' ||
                    tagName === 'input' || tagName === 'button' || tagName === 'wbr') {
                    return;
                } else {
                    this.processNode(child);
                }
            }
        });
    }

    setInitialState(span) {
        if (this._effectsActive) {
            if (this._fromTransform !== null) {
                span.style.transform = this._fromTransform;
            }
            if (this._fromStyles.opacity !== undefined) {
                span.style.opacity = String(this._fromStyles.opacity);
            }
            if (this._fromStyles.color !== undefined) {
                span.style.color = this._fromStyles.color;
            }
            if (this._fromStyles.fontSize !== undefined) {
                span.style.fontSize = this._fromStyles.fontSize;
            }
            if (this._fromStyles.letterSpacing !== undefined) {
                span.style.letterSpacing = this._fromStyles.letterSpacing;
            }
            span.style.transition = `opacity ${this.duration}ms ease-out, transform ${this.duration}ms ease-out, color ${this.duration}ms ease-out, font-size ${this.duration}ms ease-out, letter-spacing ${this.duration}ms ease-out`;
        } else {
            span.style.opacity = '0';
            span.style.transform = 'translateY(30px)';
            span.style.transition = `opacity ${this.duration}ms ease-out, transform ${this.duration}ms ease-out`;
        }
    }

    animate() {
        const delayPerChar = this.duration * this.overlap;

        let indices = [];
        if (this.random) {
            indices = Array.from({ length: this.charSpans.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
        } else {
            indices = Array.from({ length: this.charSpans.length }, (_, i) => i);
        }

        indices.forEach((originalIndex, animationIndex) => {
            const delay = animationIndex * delayPerChar;
            const span = this.charSpans[originalIndex];
            this.scheduleSpanTimeout(span, delay, () => {
                this.executeAnimation(span);
            });
        });
    }

    resetAnimation() {
        this.animated = false;
        this.entrySide = null;
        this.charSpans.forEach(span => {
            this.clearSpanTimeouts(span);
            this.setInitialState(span);
        });
    }

    executeAnimation(span) {
        if (this._effectsActive) {
            if (this._toStyles.opacity !== undefined) {
                span.style.opacity = String(this._toStyles.opacity);
            } else {
                span.style.opacity = '1';
            }
            if (this._toTransform !== null) {
                span.style.transform = this._toTransform;
            } else {
                span.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
            }
            if (this._toStyles.color !== undefined) {
                span.style.color = this._toStyles.color;
            }
            if (this._toStyles.fontSize !== undefined) {
                span.style.fontSize = this._toStyles.fontSize;
            }
            if (this._toStyles.letterSpacing !== undefined) {
                span.style.letterSpacing = this._toStyles.letterSpacing;
            }

            const seqTasks = [];
            const perPropAnimate = (applyFn, values) => {
                if (!Array.isArray(values) || values.length <= 2) return;
                const stepDur = Math.max(1, Math.floor(this.duration / (values.length - 1)));
                for (let i = 1; i < values.length; i++) {
                    seqTasks.push({ delay: (i - 1) * stepDur, dur: stepDur, val: values[i], applyFn });
                }
            };

            const composeTransform = (overrideKey, overrideVal) => {
                const parts = [];
                this._order.forEach(k => {
                    let v = null;
                    if (k === overrideKey) {
                        v = overrideVal;
                    } else {
                        v = (this._toTransform && this._toTransform.includes(k)) ? null : null;
                        v = (k in this._seqT && Array.isArray(this._seqT[k]) && this._seqT[k].length > 0) ? this._seqT[k][this._seqT[k].length - 1] : (this._toStyles && null);
                    }
                });
                const base = this._toTransform || '';
                const map = { translateX: null, translateY: null, skewX: null, skewY: null, scale: null, rotate: null };
                base.split(' ').forEach(tok => {
                    if (!tok) return;
                    if (tok.startsWith('translateX(')) map.translateX = tok.slice(11, -1);
                    else if (tok.startsWith('translateY(')) map.translateY = tok.slice(11, -1);
                    else if (tok.startsWith('skewX(')) map.skewX = tok.slice(6, -1);
                    else if (tok.startsWith('skewY(')) map.skewY = tok.slice(6, -1);
                    else if (tok.startsWith('scale(')) map.scale = tok.slice(6, -1);
                    else if (tok.startsWith('rotate(')) map.rotate = tok.slice(7, -1);
                });
                if (overrideKey) map[overrideKey] = overrideVal;
                const out = [];
                this._order.forEach(k => {
                    if (map[k] !== null) {
                        if (k === 'translateX') out.push(`translateX(${map[k]})`);
                        if (k === 'translateY') out.push(`translateY(${map[k]})`);
                        if (k === 'skewX') out.push(`skewX(${map[k]})`);
                        if (k === 'skewY') out.push(`skewY(${map[k]})`);
                        if (k === 'scale') out.push(`scale(${map[k]})`);
                        if (k === 'rotate') out.push(`rotate(${map[k]})`);
                    }
                });
                return out.join(' ');
            };

            Object.keys(this._seqT).forEach(key => {
                perPropAnimate((val) => {
                    span.style.transition = `opacity ${Math.max(1, Math.floor(this.duration / (this._seqT[key].length - 1)))}ms ease-out, transform ${Math.max(1, Math.floor(this.duration / (this._seqT[key].length - 1)))}ms ease-out, color ${Math.max(1, Math.floor(this.duration / (this._seqT[key].length - 1)))}ms ease-out, font-size ${Math.max(1, Math.floor(this.duration / (this._seqT[key].length - 1)))}ms ease-out, letter-spacing ${Math.max(1, Math.floor(this.duration / (this._seqT[key].length - 1)))}ms ease-out`;
                    span.style.transform = composeTransform(key, val);
                }, this._seqT[key]);
            });
            Object.keys(this._seqS).forEach(key => {
                perPropAnimate((val) => {
                    span.style.transition = `opacity ${Math.max(1, Math.floor(this.duration / (this._seqS[key].length - 1)))}ms ease-out, transform ${Math.max(1, Math.floor(this.duration / (this._seqS[key].length - 1)))}ms ease-out, color ${Math.max(1, Math.floor(this.duration / (this._seqS[key].length - 1)))}ms ease-out, font-size ${Math.max(1, Math.floor(this.duration / (this._seqS[key].length - 1)))}ms ease-out, letter-spacing ${Math.max(1, Math.floor(this.duration / (this._seqS[key].length - 1)))}ms ease-out`;
                    if (key === 'opacity') span.style.opacity = String(val);
                    else if (key === 'color') span.style.color = val;
                    else if (key === 'fontSize') span.style.fontSize = val;
                    else if (key === 'letterSpacing') span.style.letterSpacing = val;
                }, this._seqS[key]);
            });

            seqTasks.forEach(task => {
                this.scheduleSpanTimeout(span, task.delay, () => {
                    task.applyFn(task.val);
                });
            });
        } else {
            span.style.opacity = '1';
            span.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
        }
    }

    scheduleSpanTimeout(span, delay, callback) {
        if (this._destroyed) return;

        const tid = setTimeout(() => {
            this._activeTimeoutIds.delete(tid);
            if (span) this.removeSpanTimeout(span, tid);
            if (this._destroyed) return;
            callback();
        }, delay);

        this._activeTimeoutIds.add(tid);
        if (span) this.addSpanTimeout(span, tid);
    }

    addSpanTimeout(span, tid) {
        if (!span) return;
        let set = this._spanTimeoutIds.get(span);
        if (!set) {
            set = new Set();
            this._spanTimeoutIds.set(span, set);
        }
        set.add(tid);
    }

    removeSpanTimeout(span, tid) {
        const set = this._spanTimeoutIds.get(span);
        if (!set) return;
        set.delete(tid);
        if (set.size === 0) {
            this._spanTimeoutIds.delete(span);
        }
    }

    clearSpanTimeouts(span) {
        const set = this._spanTimeoutIds.get(span);
        if (!set) return;
        set.forEach((tid) => {
            clearTimeout(tid);
            this._activeTimeoutIds.delete(tid);
        });
        this._spanTimeoutIds.delete(span);
    }

    enableScrollMonitor() {
        if (this._destroyed) return;
        if (this._scrollListening) return;
        this._scrollListening = true;
        window.addEventListener('scroll', this._onScrollThrottled, { passive: true });
    }

    disableScrollMonitor() {
        if (!this._scrollListening) return;
        this._scrollListening = false;
        window.removeEventListener('scroll', this._onScrollThrottled, { passive: true });
    }

    onScrollThrottled() {
        if (this._destroyed) return;
        if (this._ticking) return;
        this._ticking = true;
        requestAnimationFrame(() => {
            this._ticking = false;
            this.onScroll();
        });
    }

    startMonitoring() {
        if (this._rafId || this.animated || this.entrySide === null) return;
        const loop = () => {
            if (this.animated || !this.element || !this._scrolling) {
                this._rafId = null;
                return;
            }
            const rect = this.element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (this.checkAndTriggerContinuous(rect, viewportHeight)) {
                this.animated = true;
                this.animate();
                this._rafId = null;
                window.removeEventListener('scroll', this._onScroll, { passive: true });
                if (this._scrollStopTimer) { clearTimeout(this._scrollStopTimer); this._scrollStopTimer = null; }
                return;
            }
            this._rafId = requestAnimationFrame(loop);
        };
        this._rafId = requestAnimationFrame(loop);
    }

    stopMonitoringSoon() {
        if (this._scrollStopTimer) clearTimeout(this._scrollStopTimer);
        this._scrollStopTimer = setTimeout(() => {
            this._scrolling = false;
            if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
        }, 120);
        this._activeTimeoutIds.add(this._scrollStopTimer);
    }

    onScroll() {
        if (this.animated) return;
        this._scrolling = true;
        this.startMonitoring();
        this.stopMonitoringSoon();
    }

    checkAndTriggerContinuous(rect, viewportHeight) {
        if (this.entrySide === null) return false;
        let distance = 0;
        if (this.entrySide === 'top') {
            distance = Math.max(0, rect.top);
        } else if (this.entrySide === 'bottom') {
            distance = Math.max(0, viewportHeight - rect.bottom);
        }
        return distance >= this.threshold;
    }

    initObserver() {
        if (typeof IntersectionObserver === 'undefined') {
            this.animate();
            return;
        }

        const checkAndTrigger = (rect, viewportHeight) => {
            if (this.entrySide === null) {
                return;
            }

            let shouldTrigger = false;
            let distance = 0;

            if (this.entrySide === 'top') {
                distance = Math.max(0, rect.top);
                shouldTrigger = distance >= this.threshold;
            } else if (this.entrySide === 'bottom') {
                distance = Math.max(0, viewportHeight - rect.bottom);
                shouldTrigger = distance >= this.threshold;
            }

            return shouldTrigger;
        };

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const rect = entry.boundingClientRect;
                const viewportHeight = (entry.rootBounds && entry.rootBounds.height) || window.innerHeight;
                const isIntersecting = entry.isIntersecting;
                const rootBounds = entry.rootBounds || {
                    top: 0,
                    bottom: window.innerHeight,
                    height: window.innerHeight
                };

                if (!isIntersecting) {
                    if (this.repeat && this.animated) {
                        this.resetAnimation();
                        this.enableScrollMonitor();
                    }
                    if (!this.repeat) {
                        this.disableScrollMonitor();
                    }
                    return;
                }

                if (this.animated) {
                    return;
                }

                if (this.entrySide === null) {
                    const ir = entry.intersectionRect;
                    const EPS = 2;
                    if (Math.abs(ir.top - rootBounds.top) <= EPS) {
                        this.entrySide = 'top';
                    } else if (Math.abs(ir.bottom - rootBounds.bottom) <= EPS) {
                        this.entrySide = 'bottom';
                    } else {
                        const distTop = Math.abs(rect.top - rootBounds.top);
                        const distBottom = Math.abs(rootBounds.bottom - rect.bottom);
                        this.entrySide = distTop <= distBottom ? 'top' : 'bottom';
                    }
                }

                if (this.entrySide !== null) {
                    if (checkAndTrigger(rect, viewportHeight)) {
                        this.animated = true;
                        this.animate();
                        if (!this.repeat) {
                            this._observer.unobserve(this.element);
                            if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
                            this.disableScrollMonitor();
                            if (this._scrollStopTimer) { clearTimeout(this._scrollStopTimer); this._scrollStopTimer = null; }
                        } else {
                            if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
                            if (this._scrollStopTimer) { clearTimeout(this._scrollStopTimer); this._scrollStopTimer = null; }
                        }
                    } else {
                        this.enableScrollMonitor();
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: [0]
        });

        const rect = this.element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isInitiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;

        if (isInitiallyVisible) {
            if (rect.top <= 0) {
                this.entrySide = 'top';
            } else if (rect.bottom >= viewportHeight) {
                this.entrySide = 'bottom';
            } else {
                const distTop = rect.top;
                const distBottom = viewportHeight - rect.bottom;
                this.entrySide = distTop <= distBottom ? 'top' : 'bottom';
            }
            if (checkAndTrigger(rect, viewportHeight)) {
                this.animated = true;
                this.animate();
                if (this.repeat) {
                    this._observer.observe(this.element);
                }
            } else {
                this._observer.observe(this.element);
                this.enableScrollMonitor();
            }
        } else {
            this._observer.observe(this.element);
        }
    }

    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;

        this.disableScrollMonitor();
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }

        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }

        this._activeTimeoutIds.forEach(id => {
            clearTimeout(id);
        });
        this._activeTimeoutIds.clear();

        this.charSpans.forEach(span => {
            this.clearSpanTimeouts(span);
        });

        if (this.element) {
            this.element.style.overflow = this._originalOverflow;
            this.element.innerHTML = this._originalHTML;
        }
    }
}

class ZhenshangyinBoxReveal {
    constructor(options = {}) {
        this.config = {
            threshold: options.threshold || 50,
            duration: options.duration || 800,
            delay: options.delay || 0,
            repeat: options.repeat || false,
            easing: options.easing || 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxBackground: options.boxBackground || '#000000',
            boxDirection: options.boxDirection || 'left',
            mobile: options.mobile || false
        };

        this.elements = [];
        this.animatedElements = new WeakSet();
        this.elementInitialPositions = new WeakMap();
        this.groupParents = new WeakMap();
        this.groupElements = new WeakMap();
        this.elementOriginalStyles = new WeakMap();
        this.elementRows = new WeakMap();
        this.isInitializing = true;
        this.pendingGroupAnimations = new WeakMap();

        this.scheduledAnimations = new WeakSet();
        this.scheduledTimeoutIds = new WeakMap();
        this.activeTimeoutIds = new Set();
        this.ticking = false;
        this.resizeTicking = false;
        this.boundOnScroll = this.onScroll.bind(this);
        this.boundOnResize = this.onResize.bind(this);
        this.boundOnObserver = this.onIntersect.bind(this);
        this.observer = null;
        this.useObserver = false;

        if (document.readyState === 'loading') {
            window.addEventListener('load', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (!this.config.mobile && this.isMobile()) {
            return;
        }

        this.elements = Array.from(document.querySelectorAll('[data-zhenshangyin="boxReveal"]'));

        this.elements.forEach(element => {
            const boxBackground = element.getAttribute('data-box-background') || this.config.boxBackground;
            element.style.setProperty('--box-background', boxBackground);
        });

        const groupParents = this.elements.filter(el => el.hasAttribute('data-group'));
        groupParents.forEach(parent => {
            const selector = parent.getAttribute('data-group');
            const children = Array.from(parent.querySelectorAll(selector));

            if (children.length) {
                this.groupParents.set(parent, true);
                this.storeOriginalStyles(parent);
                children.forEach(child => {
                    this.storeOriginalStyles(child);
                });

                this.storeInitialPosition(parent);
                children.forEach(child => {
                    this.storeInitialPosition(child);
                });

                let processedChildren = [...children];
                if (parent.hasAttribute('data-random')) {
                    processedChildren = this.shuffleArray([...children]);
                }

                this.groupElements.set(parent, processedChildren);
                this.pendingGroupAnimations.set(parent, new Set(processedChildren));
                this.setupGroupElements(parent, processedChildren);
            }
        });

        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                this.storeOriginalStyles(element);
                this.storeInitialPosition(element);
                this.setInitialStyles(element);
            }
        });

        this.useObserver = !this.config.repeat && typeof IntersectionObserver !== 'undefined';
        if (this.useObserver) {
            this.setupObserver();
            window.addEventListener('resize', this.boundOnResize, { passive: true });
        } else {
            this.scrollHandler = this.boundOnScroll;
            window.addEventListener('scroll', this.scrollHandler, { passive: true });
            window.addEventListener('resize', this.boundOnResize, { passive: true });
        }

        requestAnimationFrame(() => {
            this.handleInitialAnimation();
            this.isInitializing = false;
            if (!this.useObserver) {
                this.handleScroll();
            }
        });
    }

    onScroll() {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            this.ticking = false;
            this.handleScroll();
        });
    }

    onResize() {
        if (this.resizeTicking) return;
        this.resizeTicking = true;
        requestAnimationFrame(() => {
            this.resizeTicking = false;
            this.refresh();
            if (!this.useObserver) {
                this.handleScroll();
            }
        });
    }

    refresh() {
        this.elements.forEach(element => {
            if (!this.groupParents.has(element)) {
                this.storeInitialPosition(element);
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent)) {
                this.storeInitialPosition(parent);
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                children.forEach(child => {
                    this.storeInitialPosition(child);
                });

                const rowMap = new Map();
                children.forEach(child => {
                    const rect = child.getBoundingClientRect();
                    const rowKey = Math.round(rect.top);
                    if (!rowMap.has(rowKey)) {
                        rowMap.set(rowKey, []);
                    }
                    rowMap.get(rowKey).push(child);
                });

                const sortedRows = Array.from(rowMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([_, elements]) => elements);

                this.elementRows.set(parent, sortedRows);
            }
        });

        if (this.useObserver && this.observer) {
            this.observer.disconnect();
            this.observer = null;
            this.setupObserver();
        }
    }

    setupObserver() {
        const t = this.config.threshold || 0;
        const rootMargin = `-${t}px 0px -${t}px 0px`;
        this.observer = new IntersectionObserver(this.boundOnObserver, {
            root: null,
            rootMargin,
            threshold: 0
        });

        this.elements.forEach(el => {
            this.observer.observe(el);
        });
    }

    onIntersect(entries) {
        if (this.isInitializing) return;

        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;

            if (this.groupParents.has(element)) {
                if (this.animatedElements.has(element)) return;
                const children = this.groupElements.get(element);
                if (!children || !children.length) return;

                const nextTrigger = parseFloat(element.getAttribute('data-next-trigger') || 0.2);
                const baseDelay = parseInt(element.getAttribute('data-delay') || this.config.delay);
                children.forEach((child, index) => {
                    const delay = baseDelay + (index * nextTrigger * 1000);
                    this.scheduleAnimation(child, delay, () => {
                        this.animateElement(child);
                    });
                });

                this.animatedElements.add(element);
                return;
            }

            if (this.animatedElements.has(element)) return;
            const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
            this.scheduleAnimation(element, delay, () => {
                
                this.animateElement(element);
            });
        });
    }

    setupGroupElements(parent, children) {
        const hasRandomDirection = parent.hasAttribute('data-random-direction');
        const directions = ['left', 'right', 'top', 'bottom'];

        children.forEach(element => {
            element.classList.add('zhengshangyin-box-reveal-item');

            if (!element.hasAttribute('data-zhenshangyin')) {
                element.setAttribute('data-zhenshangyin', 'boxReveal');
            }

            const boxBackground = element.getAttribute('data-box-background') || parent.getAttribute('data-box-background') || this.config.boxBackground;
            element.style.setProperty('--box-background', boxBackground);

            if (!element.querySelector('.zhengshangyin-box-reveal-content')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'zhengshangyin-box-reveal-content';
                while (element.firstChild) {
                    wrapper.appendChild(element.firstChild);
                }
                element.appendChild(wrapper);
            }

            if (hasRandomDirection) {
                const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                element.setAttribute('data-box-direction', randomDirection);
                element._boxDirection = randomDirection;
            } else {
                const boxDirection = parent.getAttribute('data-box-direction') || this.config.boxDirection;
                element.setAttribute('data-box-direction', boxDirection);
                element._boxDirection = boxDirection;
            }

            this.setInitialStyles(element);

            const rect = element.getBoundingClientRect();
            const rowKey = Math.round(rect.top);
            if (!this.elementRows.has(parent)) {
                this.elementRows.set(parent, new Map());
            }
            const rowMap = this.elementRows.get(parent);
            if (!rowMap.has(rowKey)) {
                rowMap.set(rowKey, []);
            }
            rowMap.get(rowKey).push(element);
        });

        const sortedRows = Array.from(this.elementRows.get(parent).entries())
            .sort(([a], [b]) => a - b)
            .map(([_, elements]) => elements);

        this.elementRows.set(parent, sortedRows);
    }

    setInitialStyles(element) {
        if (!element.querySelector('.zhengshangyin-box-reveal-content')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'zhengshangyin-box-reveal-content';
            while (element.firstChild) {
                wrapper.appendChild(element.firstChild);
            }
            element.appendChild(wrapper);
        }

        const boxDirection = element.getAttribute('data-box-direction') || this.config.boxDirection;
        const duration = parseInt(element.getAttribute('data-duration') || this.config.duration);
        element.style.setProperty('--duration', `${duration}ms`);
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.setAttribute('data-box-direction', boxDirection);
        element._boxDirection = boxDirection;
    }

    animateElement(element) {
        element.classList.add('active');
        const duration = parseInt(element.getAttribute('data-duration') || this.config.duration);
        this.animatedElements.add(element);
    }

    resetElement(element) {
        element.classList.add('disable-transitions');
        element.classList.remove('active');
        void element.offsetHeight;
        element.classList.remove('disable-transitions');

        this.animatedElements.delete(element);
    }

    storeOriginalStyles(element) {
        this.elementOriginalStyles.set(element, {
            position: element.style.position,
            overflow: element.style.overflow
        });
    }

    storeInitialPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        this.elementInitialPositions.set(element, {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop
        });
    }

    isElementInView(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const threshold = this.config.threshold;
        return rect.top <= windowHeight - threshold && rect.bottom >= threshold;
    }

    isElementCompletelyOutOfView(element) {
        if (!element) return true;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.bottom < 0 || rect.top > windowHeight;
    }

    handleScroll() {
        if (this.isInitializing) return;
        if (this.config.repeat) {
            this.elements.forEach(element => {
                if (!this.groupParents.has(element) &&
                    this.animatedElements.has(element) &&
                    this.isElementCompletelyOutOfView(element)) {
                    this.resetElement(element);
                }
            });

            this.elements.forEach(parent => {
                if (this.groupParents.has(parent) && this.animatedElements.has(parent)) {
                    const children = this.groupElements.get(parent);
                    if (!children || !children.length) return;

                    const allOutOfView = children.every(child => this.isElementCompletelyOutOfView(child));
                    if (allOutOfView) {
                        children.forEach(child => {
                            if (this.animatedElements.has(child)) {
                                this.resetElement(child);
                            }
                        });
                        this.animatedElements.delete(parent);
                    }
                }
            });
        }

        this.elements.forEach(element => {
            if (!this.groupParents.has(element) &&
                this.isElementInView(element) &&
                !this.animatedElements.has(element)) {
                const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
                this.scheduleAnimation(element, delay, () => {
                    this.animateElement(element);
                });
            }
        });

        this.elements.forEach(parent => {
            if (this.groupParents.has(parent) &&
                this.isElementInView(parent) &&
                !this.animatedElements.has(parent)) {
                const children = this.groupElements.get(parent);
                if (!children || !children.length) return;

                const nextTrigger = parseFloat(parent.getAttribute('data-next-trigger') || 0.2);
                const baseDelay = parseInt(parent.getAttribute('data-delay') || this.config.delay);

                children.forEach((child, index) => {
                    const delay = baseDelay + (index * nextTrigger * 1000);
                    this.scheduleAnimation(child, delay, () => {
                        this.animateElement(child);
                    });
                });

                this.animatedElements.add(parent);
            }
        });
    }

    handleInitialAnimation() {
        this.elements.forEach(element => {
            if (this.isElementInView(element)) {
                if (this.groupParents.has(element)) {
                    const children = this.groupElements.get(element);
                    if (!children || !children.length) return;

                    const nextTrigger = parseFloat(element.getAttribute('data-next-trigger') || 0.2);
                    const baseDelay = parseInt(element.getAttribute('data-delay') || this.config.delay);

                    children.forEach((child, index) => {
                        const delay = baseDelay + (index * nextTrigger * 1000);
                        this.scheduleAnimation(child, delay, () => {
                            this.animateElement(child);
                        });
                    });

                    this.animatedElements.add(element);
                } else {
                    const delay = parseInt(element.getAttribute('data-delay') || this.config.delay);
                    this.scheduleAnimation(element, delay, () => {
                        this.animateElement(element);
                    });
                }
            }
        });
    }

    scheduleAnimation(element, delay, callback) {
        if (this.animatedElements.has(element) || this.scheduledAnimations.has(element)) return;

        this.cancelScheduledAnimation(element);
        this.scheduledAnimations.add(element);

        const tid = setTimeout(() => {
            this.activeTimeoutIds.delete(tid);
            this.scheduledTimeoutIds.delete(element);
            this.scheduledAnimations.delete(element);

            if (this.animatedElements.has(element)) return;
            callback();
        }, delay);

        this.scheduledTimeoutIds.set(element, tid);
        this.activeTimeoutIds.add(tid);
    }

    cancelScheduledAnimation(element) {
        this.scheduledAnimations.delete(element);
        const tid = this.scheduledTimeoutIds.get(element);
        if (tid) {
            clearTimeout(tid);
            this.activeTimeoutIds.delete(tid);
            this.scheduledTimeoutIds.delete(element);
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.boundOnResize);

        this.activeTimeoutIds.forEach(id => {
            clearTimeout(id);
        });
        this.activeTimeoutIds.clear();

        this.elements.forEach(element => {
            const originalStyles = this.elementOriginalStyles.get(element);
            if (originalStyles) {
                element.style.position = originalStyles.position || '';
                element.style.overflow = originalStyles.overflow || '';
            }
            element.classList.remove('active');
        });

        this.elements = [];
        this.animatedElements = new WeakSet();
        this.elementInitialPositions = new WeakMap();
        this.groupParents = new WeakMap();
        this.groupElements = new WeakMap();
        this.elementOriginalStyles = new WeakMap();
        this.elementRows = new WeakMap();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}
