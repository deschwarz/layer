+function($, undefined) {

    'use strict';

    /**
     * { Layer function }
     *
     * @class      Layer (name)
     * @param      {$ object}  $Element       The element
     * @param      {object}  oExternalConfig  The external configuration
     */
    var Layer = function($Element, oExternalConfig) {

        var oSelf = this;

        oSelf.sGlobalPrefix = 'jo';

        oSelf.oClasses = {
            
            
            initClass: oSelf.sGlobalPrefix + '-init', //inits function of justOverlay
            wrapperClass: oSelf.sGlobalPrefix + '-wrapper', //needs for toggling show/hide)
            indexClass: oSelf.sGlobalPrefix + '-index', //needs for Basic-CSS
            contentClass: oSelf.sGlobalPrefix + '-content', //place html-content of Layer here
            contentOrigin: oSelf.sGlobalPrefix + '-origin',
            isScrolling: oSelf.sGlobalPrefix + '-scrolling',
            dataLayerId: 'data-' + oSelf.sGlobalPrefix + '-id',
            customOptions: oSelf.sGlobalPrefix + '-custom',
            closeElement: oSelf.sGlobalPrefix + '-close',
            closeElementText: 'X'
        };

        oSelf.oOptions = {
            styleClass: '',
            close: 'button', //button, overlay
            
            //basic Style
            padding: '10',
            backgroundOpacity: '75',
            borderWidth: '2'
        };

        // extend default config with js init object
        $.extend(oSelf.oOptions, oExternalConfig);

        // the element related to this instance
        oSelf.$Element = $Element;

        oSelf.init();
    };

    /**
     * { init function }
     */
    Layer.prototype.init = function() {

        var oSelf = this;

        //build main wrapper
        if (!$('.'+oSelf.oClasses.wrapperClass).length) {
            oSelf.buildMarkup('div', oSelf.oClasses.wrapperClass, $('body'));
        }

        //on click: open layer
        oSelf.bindEvent(oSelf.$Element, 'click');


    };

    /**
    * { bind events }
    *
    * @param      {string}  sElement  The element
    * @param      {string}  sEvent    The event
    */
    Layer.prototype.bindEvent = function(sElement, sEvent) {

        var oSelf = this;

        $(sElement).on(sEvent,  function(e) {

            switch (sElement) {
                case oSelf.$Element:
                    e.preventDefault();
                    oSelf.openLayer($(this));
                    break;
                case '.' + oSelf.oClasses.closeElement:
                    e.stopPropagation();
                    oSelf.closeLayer();
                    break;   
                case '.' + oSelf.oClasses.wrapperClass:
                    e.stopPropagation();
                    if ($(e.target).hasClass(oSelf.oClasses.wrapperClass)) {
                        oSelf.closeLayer();
                    }
            }
        });
    };

    /**
    * Builds a markup.
    * position wrapper to start of body 
    * and other builded element as child of wrapper
    *
    * @param      {string}  sElement        The element
    * @param      {string}  sClassName      The class name
    * @param      {$ object}  $PrependParent  The prepend parent
    */
    Layer.prototype.buildMarkup = function(sElement, sClassName, $PrependParent) {
        var oElement = document.createElement(sElement);
        oElement.className = sClassName; // name class
        $PrependParent.prepend(oElement);
    };


     /**
      * find reference Layer.
      *
      * @param      {string}  id 
      * @return     {$ Object}  { layer Element }
      */
    Layer.prototype.findReferenceLayer = function(sId) {
        var oSelf = this,
            sThisId = sId,
            $ReferenceLayer = $('body').find('[' + oSelf.oClasses.dataLayerId + '~=' + sThisId + ']');
        return $ReferenceLayer;
    };

     /**
      * Opens a layer.
      *
      * @param {$ Object}  $This The this
      */
    Layer.prototype.openLayer = function($This) {
        var oSelf = this,
            sDataId = oSelf.$Element.attr('id'), // get layer id (for corresponding layer template data-jo-id)
            $LayerContent = oSelf.findReferenceLayer(sDataId),
            // flag opened Layer in wrapper (get class from id)
            sIdentifyClass = oSelf.sGlobalPrefix + '-generated-' + $LayerContent.attr(oSelf.oClasses.dataLayerId).replace(/ /g,''), 
            sInnerHtml = '',
            sWrapperClass = '.' + oSelf.oClasses.wrapperClass;

        //check layer has opened before
        if (!$(sWrapperClass).hasClass(sIdentifyClass)) {

            sInnerHtml  =   '<div class=' + oSelf.oClasses.contentClass + '>'
                        +       '<div class=' + oSelf.oClasses.contentOrigin + '>' 
                        +           $LayerContent.html()
                        +       '</div>' 
                        +   '</div>'

            //wrap users layer-content into divs
            $LayerContent.html(sInnerHtml);

            //move users layer-content to layer wrapper and add index-content class
            $LayerContent.addClass(oSelf.oClasses.indexClass).appendTo(sWrapperClass);
            //build close-element and text this
            oSelf.buildMarkup(
                'div', 
                oSelf.oClasses.closeElement,
                $LayerContent.children('.' + oSelf.oClasses.contentClass)
            ); 
            $LayerContent.find('.' + oSelf.oClasses.closeElement).text(oSelf.oClasses.closeElementText);
        }
        
        oSelf.customOptions($This);

        //show wrapper and this layer
        $(sWrapperClass).addClass(sIdentifyClass).add($LayerContent).show();

        oSelf.hasScrollContent($LayerContent);

        //on click: close layer
        $('.' + oSelf.oClasses.closeElement).unbind('click'); //before unbind event close
        oSelf.bindEvent('.' + oSelf.oClasses.closeElement, 'click');
    };

     /**
      * Closes a layer.
      */
    Layer.prototype.closeLayer = function() {
        var oSelf = this;
        $('.' + oSelf.oClasses.indexClass).add('.' + oSelf.oClasses.wrapperClass).hide();
    };

     /**
      * read custom options from data attribut and overwrite oOptions
      *
      * @param      {$ object}   $This   The this
      * @return     {boolean} 
      */
    Layer.prototype.customOptions = function($This) {
        var oSelf = this,
            sCustomData = $This.data(oSelf.oClasses.customOptions),
            replaceOptions = {},
            $LayerContent = oSelf.findReferenceLayer($This.attr('id'));
 
        if (sCustomData) {
            replaceOptions = $.parseJSON(
                '{"' + sCustomData.replace(/=/g,'":"').replace(/,/g,'","').replace(/ /g,'') + '"}'
            );
            oSelf.oOptions = $.extend({}, oSelf.oOptions, replaceOptions);
        }

        /**
         * add basic options
         */
        //element index replace border Width
        $LayerContent.css({
            'box-shadow': '0 0 0 ' + oSelf.oOptions.borderWidth + 'px rgba(119, 119, 119, 0.5)'
        });

        //element origin replace padding 
        $LayerContent.find('.' + oSelf.oClasses.contentOrigin).css('padding',oSelf.oOptions.padding + 'px');

        //element wrapper replace background opacity
        $('.' + oSelf.oClasses.wrapperClass).css('background','rgba(0, 0, 0,' + oSelf.oOptions.backgroundOpacity/100 + ')');

        // option close on overlay or button
        if(oSelf.oOptions.close === 'overlay') {
            oSelf.bindEvent('.' + oSelf.oClasses.wrapperClass, 'click');
        } else {
            $('.' + oSelf.oClasses.wrapperClass).unbind('click');
        }
        
        //element index get custom class
         if(oSelf.oOptions.styleClass) {
            $LayerContent.addClass(oSelf.oOptions.styleClass);
         } else {
            $LayerContent.attr('class',oSelf.oClasses.indexClass);
         }
    };

    /**
     * Determines if it has scroll content.
     * fires scroll class to avoid overflow
     *
     * @param      {<type>}  elementId  The element identifier
     */
    Layer.prototype.hasScrollContent = function(elementId) {
        var oSelf = this;
        if ($(elementId).children('.' + oSelf.oClasses.contentClass).outerHeight(true) > $(elementId).outerHeight(true)) {
            $(elementId).addClass(oSelf.oClasses.isScrolling);
        }
    };

    /**
     * { function_description }
     *
     * @class      JustOverlay (name)
     * @param      {object}  oConfig  The configuration
     * @return     {<type>}  { description_of_the_return_value }
     */
    function JustOverlay(oConfig) {

        return this.each(function() {
            var $Self = $(this),
                sThisId = $Self.attr('id');
            
            if (sThisId) {
                var layer = new Layer($Self, oConfig);
            }
        });
    }

    /**
     * build jQuery object
     */
    $.fn.justOverlay = JustOverlay;

}(jQuery);