var svg_cssRules = {
    /*Assumes that height and width properties will be defined inline and not in a css class, so does not add height and width*/
    'propertyGroups' : {
        'block' : ['margin', 'padding'],
        'inline' : ['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'allowReorder', 'alphabetic', 'amplitude', 'arabic-form', 'ascent', 'attributeName', 'attributeType', 'autoReverse', 'azimuth', 'baseFrequency', 'baseline-shift', 'baseProfile', 'bbox', 'begin', 'bias', 'by', 'calcMode', 'cap-height', 'class', 'clip', 'clipPathUnits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'contentScriptType', 'contentStyleType', 'cursor', 'cx', 'cy', 'd', 'decelerate', 'descent', 'diffuseConstant', 'direction', 'display', 'divisor', 'dominant-baseline', 'dur', 'dx', 'dy', 'edgeMode', 'elevation', 'enable-background', 'end', 'exponent', 'externalResourcesRequired', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterRes', 'filterUnits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'format', 'from', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'glyphRef', 'gradientTransform', 'gradientUnits', 'hanging', 'horiz-adv-x', 'horiz-origin-x', 'id', 'ideographic', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kernelMatrix', 'kernelUnitLength', 'kerning', 'keyPoints', 'keySplines', 'keyTimes', 'lang', 'lengthAdjust', 'letter-spacing', 'lighting-color', 'limitingConeAngle', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerHeight', 'markerUnits', 'markerWidth', 'mask', 'maskContentUnits', 'maskUnits', 'mathematical', 'max', 'media', 'method', 'min', 'mode', 'name', 'numOctaves', 'offset', 'onabort', 'onactivate', 'onbegin', 'onclick', 'onend', 'onerror', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onrepeat', 'onresize', 'onscroll', 'onunload', 'onzoom', 'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'overline-position', 'overline-thickness', 'panose-1', 'paint-order', 'pathLength', 'patternContentUnits', 'patternTransform', 'patternUnits', 'pointer-events', 'points', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'preserveAlpha', 'preserveAspectRatio', 'primitiveUnits', 'r', 'radius', 'refX', 'refY', 'rendering-intent', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'result', 'rotate', 'rx', 'ry', 'scale', 'seed', 'shape-rendering', 'slope', 'spacing', 'specularConstant', 'specularExponent', 'speed', 'spreadMethod', 'startOffset', 'stdDeviation', 'stemh', 'stemv', 'stitchTiles', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'string', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style', 'surfaceScale', 'systemLanguage', 'tableValues', 'target', 'targetX', 'targetY', 'text-anchor', 'text-decoration', 'text-rendering', 'textLength', 'to', 'transform', 'type', 'u1', 'u2', 'underline-position', 'underline-thickness', 'unicode', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'values', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'viewBox', 'viewTarget', 'visibility', 'widths', 'word-spacing', 'writing-mode', 'x', 'x-height', 'x1', 'x2', 'xChannelSelector', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y', 'y1', 'y2', 'yChannelSelector', 'z', 'zoomAndPan']
    },
    'elementGroups' : {
        'inline' : ['a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern']
    }
};

function save_graph_to_image(graph_element, file_name, image_width, image_height){
    /*Saves the given d3 graph element to a png file with the given dimensions and file_name*/
    
    //Create html copy element
    var graph_copy = graph_element.clone();
    graph_copy.attr('id', 'copy_graph');
    graph_element.parent().append(graph_copy);
    ////Add all css style to the svg element
    graph_copy.inlineStyler(svg_cssRules);
    
    //Convert the graph to canvas
    var imgsrc;
    html2canvas(graph_copy, {
        onrendered: function(canvas) {
            // canvas is the final rendered <canvas> element
            imgsrc = canvas.toDataURL("image/png");
            var img = '<img src="'+imgsrc+'">'; 
            var context = canvas.getContext("2d");
        
            //Create an image object
            var image = new Image;
            image.src = imgsrc;
            image.onload = function() {
                context.drawImage(image, 0, 0);
                
                //Store the image in a download link and click the link
                var a = document.createElement("a");
                a.download = file_name + "-custom.png";
                a.href = canvas.toDataURL("image/png");
                a.target = '_blank';
                a.click();
            };
            
            //Delete the now screwed up graph html and replace it with the original
            graph_copy.remove();
        },
        background: '#FFFFFF'
    });
    
};