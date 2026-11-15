document.addEventListener('DOMContentLoaded', () => {
    // 1. Тень у шапки при скролле
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Мобильное меню (бургер)
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    const toggleMenu = () => {
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    };

    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 3. Адаптивный слайдер (работает корректно на любом размере экрана)
    const initResponsiveSlider = (viewportId, trackId, prevBtnId, nextBtnId) => {
        const viewport = document.getElementById(viewportId);
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (!viewport || !track || !prevBtn || !nextBtn || track.children.length === 0) return;

        let index = 0;

        const getMetrics = () => {
            const firstCard = track.children[0];
            const cardWidth = firstCard.getBoundingClientRect().width;
            const trackStyle = window.getComputedStyle(track);
            const gap = parseFloat(trackStyle.gap) || 0;
            const viewportWidth = viewport.getBoundingClientRect().width;

            // Определяем, сколько карточек помещается на экране
            const visibleCount = Math.max(1, Math.round((viewportWidth + gap) / (cardWidth + gap)));
            const maxIndex = Math.max(0, track.children.length - visibleCount);

            return { step: cardWidth + gap, maxIndex };
        };

        const updateSlider = () => {
            const { step, maxIndex } = getMetrics();
            if (index > maxIndex) index = maxIndex;
            if (index < 0) index = 0;

            track.style.transform = `translateX(-${index * step}px)`;
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index >= maxIndex;
        };

        nextBtn.addEventListener('click', () => {
            const { maxIndex } = getMetrics();
            if (index < maxIndex) {
                index++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                index--;
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
        updateSlider();
    };

    // Инициализация слайдеров команды и отзывов
    initResponsiveSlider('team-viewport', 'slider', 'prevBtn', 'nextBtn');
    initResponsiveSlider('review-viewport', 'review-slider', 'prevReviewBtn', 'nextReviewBtn');

    // 4. Аккордеон FAQ
    const accordionItems = document.querySelectorAll('.accordion__item');

    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion__trigger');
        const content = item.querySelector('.accordion__content');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
                otherItem.querySelector('.accordion__content').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // 5. Модальные окна
    const consultationModal = document.getElementById('consultationModal');
    const privacyModal = document.getElementById('privacyModal');
    const openConsultBtns = document.querySelectorAll('.open-modal-btn');
    const openPrivacyBtns = document.querySelectorAll('.open-privacy-btn');
    const allModals = document.querySelectorAll('.modal');

    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    openConsultBtns.forEach(btn => {
        btn.addEventListener('click', () => openModal(consultationModal));
    });

    openPrivacyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    });

    allModals.forEach(modal => {
        const overlay = modal.querySelector('.modal__overlay');
        const closeBtn = modal.querySelector('.modal__close');

        if (overlay) overlay.addEventListener('click', () => closeModal(modal));
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            allModals.forEach(modal => {
                if (modal.classList.contains('open')) {
                    closeModal(modal);
                }
            });
        }
    });

    // 6. Валидация и отправка форм
    const handleFormSubmit = (formId, statusId) => {
        const form = document.getElementById(formId);
        const statusEl = document.getElementById(statusId);
        if (!form || !statusEl) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            statusEl.textContent = '';
            statusEl.className = 'form__status';

            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            const checkbox = form.querySelector('input[type="checkbox"]');

            let hasError = false;
            [nameInput, phoneInput].forEach(input => input.classList.remove('error'));

            if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
                nameInput.classList.add('error');
                hasError = true;
            }

            const digitsCount = phoneInput.value.replace(/\D/g, '').length;
            if (digitsCount < 7) {
                phoneInput.classList.add('error');
                hasError = true;
            }

            if (checkbox && !checkbox.checked) {
                hasError = true;
            }

            if (hasError) {
                statusEl.textContent = 'Пожалуйста, укажите ваше имя и корректный номер телефона.';
                statusEl.classList.add('error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                form.reset();
                statusEl.textContent = 'Спасибо! Ваша заявка принята, позже мы с вами свяжемся.';
                statusEl.classList.add('success');
            }, 600);
        });
    };

    handleFormSubmit('contactForm', 'contactFormStatus');
    handleFormSubmit('modalForm', 'modalFormStatus');
});