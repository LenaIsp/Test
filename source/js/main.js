jQuery(($) => {
    $('.select').on('click', '.select__head', function () {
        if ($(this).hasClass('select__head--open')) {
            $(this).removeClass('select__head--open');
            $(this).next().fadeOut();
        } else {
            $('.select__head').removeClass('select__head--open');
            $('.select__list').fadeOut();
            $(this).addClass('select__head--open');
            $(this).next().fadeIn();
        }
    });

    $('.select').on('click', '.select__item', function () {
        $('.select__head').removeClass('select__head--open');
        $(this).parent().fadeOut();
        $(this).parent().prev().text($(this).text());
        $(this).parent().prev().prev().val($(this).text());
    });

    $(document).click(function (e) {
        if (!$(e.target).closest('.select').length) {
            $('.select__head').removeClass('select__head--open');
            $('.select__list').fadeOut();
        }
    });
    $('.navigation__toggle').on('click', function () {
    	$('.menu').toggleClass('menu--active');
    });
	document.getElementsByClassName('range__item')[0].addEventListener('change', function() {
	  var number = document.getElementsByClassName('range__numb')[0];
	  number.innerHTML = this.value + '%';
	});
});