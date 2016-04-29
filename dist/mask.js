System.register(["./masker"], function(exports_1) {
    var masker_1;
    var MaskValueConverter;
    return {
        setters:[
            function (masker_1_1) {
                masker_1 = masker_1_1;
            }],
        execute: function() {
            MaskValueConverter = (function () {
                function MaskValueConverter() {
                }
                MaskValueConverter.prototype.toView = function (value, format, bindMasking, placeholder) {
                    var masker = masker_1.getMasker({ maskFormat: format, bindMasking: bindMasking, placeholder: placeholder, aspnetMasking: false });
                    var result = masker.maskValue(value);
                    return result;
                };
                MaskValueConverter.prototype.fromView = function (value, format, bindMasking, placeholder) {
                    var masker = masker_1.getMasker({ maskFormat: format, bindMasking: bindMasking, placeholder: placeholder, aspnetMasking: false });
                    var result = masker.unmaskValue(value);
                    return result;
                };
                return MaskValueConverter;
            })();
            exports_1("MaskValueConverter", MaskValueConverter);
        }
    }
});
//# sourceMappingURL=mask.js.map