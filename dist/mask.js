var masker_1 = require("./masker");
var MaskValueConverter = (function () {
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
exports.MaskValueConverter = MaskValueConverter;
//# sourceMappingURL=mask.js.map