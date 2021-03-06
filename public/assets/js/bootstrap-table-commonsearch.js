/**
 * @author: pppscn <35696959@qq.com>
 * @version: v0.0.1
 *
 * @update 2017-05-07 <http://git.oschina.net/pp/fastadmin>
 */

!function ($) {
    'use strict';

    var firstLoad = false, ColumnsForSearch = [];

    var sprintf = $.fn.bootstrapTable.utils.sprintf;

    var initCommonSearch = function (pColumns, that) {
        var vFormCommon = createFormCommon(pColumns, that), timeoutId = 0;

        var vModal = sprintf("<div id=\"commonSearchContent_%s\" class=\"common-search-table %s\">", that.options.idTable, that.options.searchFormVisible ? "" : "hidden");
        vModal += vFormCommon.join('');
        vModal += "</div>";
        that.$container.prepend($(vModal));

        var form = $("#commonSearchForm" + "_" + that.options.idTable);

        //绑定日期时间元素事件
        if ($(".datetimepicker", form).size() > 0) {

            require(['bootstrap-datetimepicker'], function () {
                $('.datetimepicker', form).parent().css('position', 'relative');
                $('.datetimepicker', form).datetimepicker({
                    //format: 'YYYY-MM-DD',
                    icons: {
                        time: 'fa fa-clock-o',
                        date: 'fa fa-calendar',
                        up: 'fa fa-chevron-up',
                        down: 'fa fa-chevron-down',
                        previous: 'fa fa-chevron-left',
                        next: 'fa fa-chevron-right',
                        today: 'fa fa-history',
                        clear: 'fa fa-trash',
                        close: 'fa fa-remove'
                    },
                    showTodayButton: true,
                    showClose: true
                });
            });
        }

        // 表单提交
        form.on("submit", function (event) {
            that.onColumnCommonSearch();
            return false;
        });

        // 重置搜索
        form.on("click", "#btnResetCommon" + "_" + that.options.idTable, function (event) {
            form[0].reset();
            that.onColumnCommonSearch();
        });

    };

    var createFormCommon = function (pColumns, that) {
        var htmlForm = [];
        var opList = ['=', '>', '>=', '<', '<=', '!=', 'LIKE', 'LIKE %...%', 'NOT LIKE', 'IN(...)', 'NOT IN(...)', 'BETWEEN', 'NOT BETWEEN', 'IS NULL', 'IS NOT NULL'];
        htmlForm.push(sprintf('<form class="form-inline" id="commonSearchForm_%s" action="%s" >', that.options.idTable, that.options.actionForm));
        htmlForm.push('<fieldset>');
        if (that.options.titleForm.length > 0)
            htmlForm.push(sprintf("<legend>%s</legend>", that.options.titleForm));
        for (var i in pColumns) {
            var vObjCol = pColumns[i];
            if (!vObjCol.checkbox && vObjCol.field !== 'operate' && vObjCol.searchable && vObjCol.operate !== false) {
                var query = Backend.api.query(vObjCol.field);
                query = query ? query : '';
                vObjCol.defaultValue = that.options.renderDefault && query != '' ? query : (typeof vObjCol.defaultValue === 'undefined' ? '' : vObjCol.defaultValue);
                ColumnsForSearch.push(vObjCol);
                htmlForm.push('<div class="form-group" style="margin:5px">');
                htmlForm.push(sprintf('<label for="%s" class="control-label" style="padding:0 10px">%s</label>', vObjCol.field, vObjCol.title));
                //htmlForm.push('<div class="col-sm-2">');
                //htmlForm.push(sprintf('<select class="form-control" name="field-%s" data-name="%s">%s</select>', vObjCol.field, vObjCol.field, selectHtml));
                vObjCol.operate = (typeof vObjCol.operate === 'undefined' || $.inArray(vObjCol.operate, opList) === -1) ? '=' : vObjCol.operate;
                htmlForm.push(sprintf('<input type="hidden" class="form-control operate" name="field-%s" data-name="%s" value="%s" readonly>', vObjCol.field, vObjCol.field, vObjCol.operate));
                //htmlForm.push('</div>');

                //htmlForm.push('<div class="col-sm-8">');
                var style = typeof vObjCol.style === 'undefined' ? '' : sprintf('style="%s"', vObjCol.style);
                if (vObjCol.searchList) {
                    if (typeof vObjCol.searchList == 'function') {
                        htmlForm.push(vObjCol.searchList.call(this, vObjCol));
                    } else {
                        var isArray = vObjCol.searchList.constructor === Array;
                        var searchList = [];
                        searchList.push(sprintf('<option value="">%s</option>', that.options.formatCommonChoose()));
                        $.each(vObjCol.searchList, function (key, value) {
                            var isSelect = (isArray ? value : key) === vObjCol.defaultValue ? 'selected' : '';
                            searchList.push(sprintf("<option value='" + (isArray ? value : key) + "' %s>" + value + "</option>", isSelect));
                        });
                        htmlForm.push(sprintf('<select class="form-control" name="%s" %s>%s</select>', vObjCol.field, style, searchList.join('')));
                    }
                } else {
                    var placeholder = typeof vObjCol.placeholder === 'undefined' ? vObjCol.title : vObjCol.placeholder;
                    var type = typeof vObjCol.type === 'undefined' ? 'text' : vObjCol.type;
                    var addclass = typeof vObjCol.addclass === 'undefined' ? 'form-control' : 'form-control ' + vObjCol.addclass;
                    var data = typeof vObjCol.data === 'undefined' ? '' : vObjCol.data;
                    var defaultValue = typeof vObjCol.defaultValue === 'undefined' ? '' : vObjCol.defaultValue;
                    if (/BETWEEN$/.test(vObjCol.operate)) {
                        var defaultValueArr = /^.+|.+$/.test(defaultValue) ? defaultValue.split('|') : ['', ''];
                        htmlForm.push(sprintf('<input type="%s" class="%s" name="%s" value="%s" placeholder="%s" id="%s" %s %s>', type, addclass, vObjCol.field, defaultValueArr[0], placeholder, vObjCol.field, style, data));
                        htmlForm.push(sprintf('&nbsp;-&nbsp;<input type="%s" class="%s" name="%s" value="%s" placeholder="%s" id="%s" %s %s>', type, addclass, vObjCol.field, defaultValueArr[1], placeholder, vObjCol.field, style, data));
                    } else {
                        htmlForm.push(sprintf('<input type="%s" class="%s" name="%s" value="%s" placeholder="%s" id="%s" %s %s>', type, addclass, vObjCol.field, defaultValue, placeholder, vObjCol.field, style, data));
                    }
                }

                //htmlForm.push('</div>');
                htmlForm.push('</div>');
            }
        }

        htmlForm.push(createFormBtn(that).join(''));
        htmlForm.push('</fieldset>');
        htmlForm.push('</form>');

        return htmlForm;
    };

    var createFormBtn = function (that) {
        var htmlBtn = [];
        var searchSubmit = that.options.formatCommonSubmitButton();
        var searchReset = that.options.formatCommonResetButton();
        htmlBtn.push('<div class="form-group" style="margin:5px">');
        htmlBtn.push('<div class="col-sm-12 text-center">');
        htmlBtn.push(sprintf('<button type="submit" id="btnSubmitCommon%s" class="btn btn-success" >%s</button> ', "_" + that.options.idTable, searchSubmit));
        htmlBtn.push(sprintf('<button type="button" id="btnResetCommon%s" class="btn btn-default" >%s</button> ', "_" + that.options.idTable, searchReset));
        htmlBtn.push('</div>');
        htmlBtn.push('</div>');
        return htmlBtn;
    };

    var isSearchAvailble = function (that) {
        //只支持服务端搜索
        if (!that.options.commonSearch || that.options.sidePagination != 'server' || !that.options.url) {
            return false;
        }

        if (!that.options.idTable) {
            return false;
        }
        return true;
    };

    var getSearchQuery = function (that) {
        var op = {};
        var filter = {};
        $("#commonSearchContent_" + that.options.idTable + " input.operate").each(function (i) {
            var name = $(this).data("name");
            var sym = $(this).val();
            var obj = $("[name='" + name + "']");
            if (obj.size() == 0)
                return true;
            var vObjCol = ColumnsForSearch[i];
            if (obj.size() > 1) {
                if (/BETWEEN$/.test(sym)) {
                    var value_begin = $.trim($("[name='" + name + "']:first").val()), value_end = $.trim($("[name='" + name + "']:last").val());
                    if (!value_begin.length || !value_end.length) {
                        return true;
                    }
                    if (typeof vObjCol.process === 'function') {
                        value_begin = vObjCol.process(value_begin, 'begin');
                        value_end = vObjCol.process(value_end, 'end');
                    } else if ($("[name='" + name + "']:first").attr('type') === 'datetime') { //datetime类型字段转换成时间戳
                        var Hms = Moment(value_begin).format("HH:mm:ss");
                        value_begin = parseInt(Moment(value_begin) / 1000);
                        value_end = parseInt(Moment(value_end) / 1000);
                        if (value_begin === value_end && '00:00:00' === Hms) {
                            value_end += 86399;
                        }
                    }
                    var value = value_begin + ',' + value_end;
                } else {
                    var value = $("[name='" + name + "']:checked").val();
                }
            } else {
                var value = (typeof vObjCol.process === 'function') ? vObjCol.process(obj.val()) : (sym == 'LIKE %...%' ? obj.val().replace(/\*/g, '%') : obj.val());
            }
            if (value == '' && sym.indexOf("NULL") == -1) {
                return true;
            }

            op[name] = sym;
            filter[name] = value;
        });
        return {op: op, filter: filter};
    };

    $.extend($.fn.bootstrapTable.defaults, {
        commonSearch: false,
        titleForm: "Common search",
        actionForm: "",
        idTable: undefined,
        searchFormVisible: true,
        searchClass: 'searchit',
        renderDefault: true,
        onColumnCommonSearch: function (field, text) {
            return false;
        }
    });

    $.extend($.fn.bootstrapTable.defaults.icons, {
        commonSearchIcon: 'glyphicon-search'
    });

    $.extend($.fn.bootstrapTable.Constructor.EVENTS, {
        'column-common-search.bs.table': 'onColumnCommonSearch'
    });

    $.extend($.fn.bootstrapTable.locales[$.fn.bootstrapTable.defaults.locale], {
        formatCommonSearch: function () {
            return "Common search";
        },
        formatCommonSubmitButton: function () {
            return "Submit";
        },
        formatCommonResetButton: function () {
            return "Reset";
        },
        formatCommonCloseButton: function () {
            return "Close";
        },
        formatCommonChoose: function () {
            return "Choose";
        }
    });

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales);

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
            _initToolbar = BootstrapTable.prototype.initToolbar,
            _load = BootstrapTable.prototype.load,
            _initSearch = BootstrapTable.prototype.initSearch;

    BootstrapTable.prototype.initToolbar = function () {
        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (!isSearchAvailble(this)) {
            return;
        }

        var that = this,
                html = [];
        html.push(sprintf('<div class="columns-%s pull-%s" style="margin-top:10px;">', this.options.buttonsAlign, this.options.buttonsAlign));
        html.push(sprintf('<button class="btn btn-default%s' + '" type="button" name="commonSearch" title="%s">', that.options.iconSize === undefined ? '' : ' btn-' + that.options.iconSize, that.options.formatCommonSearch()));
        html.push(sprintf('<i class="%s %s"></i>', that.options.iconsPrefix, that.options.icons.commonSearchIcon))
        html.push('</button></div>');

        that.$toolbar.prepend(html.join(''));

        initCommonSearch(that.columns, that);

        var searchContainer = $("#commonSearchContent_" + that.options.idTable);

        that.$toolbar.find('button[name="commonSearch"]')
                .off('click').on('click', function () {
            searchContainer.toggleClass("hidden");
            return;
        });

        that.$container.on("click", "." + that.options.searchClass, function () {
            var obj = $("form [name='" + $(this).data("field") + "']", searchContainer);
            if (obj.size() > 0) {
                obj.val($(this).data("value"));
                $("form", searchContainer).trigger("submit");
            }
        });

        var searchquery = getSearchQuery(this);
        this.options.queryParams = function (params) {
            return {
                search: params.search,
                sort: params.sort,
                order: params.order,
                filter: JSON.stringify(searchquery.filter),
                op: JSON.stringify(searchquery.op),
                offset: params.offset,
                limit: params.limit,
            };
        };

    };

    BootstrapTable.prototype.load = function (data) {
        _load.apply(this, Array.prototype.slice.apply(arguments));

        if (!isSearchAvailble(this)) {
            return;
        }
        if (!firstLoad) {
            var height = parseInt($(".bootstrap-table").height());
            height += 10;
            $("#" + this.options.idTable).bootstrapTable("resetView", {height: height});
            firstLoad = true;
        }
    };

    BootstrapTable.prototype.initSearch = function () {
        _initSearch.apply(this, Array.prototype.slice.apply(arguments));

        if (!isSearchAvailble(this)) {
            return;
        }

        var that = this;
        var fp = $.isEmptyObject(this.filterColumnsPartial) ? null : this.filterColumnsPartial;
        this.data = fp ? $.grep(this.data, function (item, i) {
            for (var key in fp) {
                var fval = fp[key].toLowerCase();
                var value = item[key];
                value = $.fn.bootstrapTable.utils.calculateObjectValue(that.header,
                        that.header.formatters[$.inArray(key, that.header.fields)],
                        [value, item, i], value);

                if (!($.inArray(key, that.header.fields) !== -1 &&
                        (typeof value === 'string' || typeof value === 'number') &&
                        (value + '').toLowerCase().indexOf(fval) !== -1)) {
                    return false;
                }
            }
            return true;
        }) : this.data;
    };

    BootstrapTable.prototype.onColumnCommonSearch = function (event) {
        if (typeof event === 'undefined') {
            var searchquery = getSearchQuery(this);
            // 追加查询关键字
            this.options.pageNumber = 1;
            this.options.queryParams = function (params) {
                return {
                    search: params.search,
                    sort: params.sort,
                    order: params.order,
                    filter: JSON.stringify(searchquery.filter),
                    op: JSON.stringify(searchquery.op),
                    offset: params.offset,
                    limit: params.limit,
                };
            };
            this.refresh({query: {filter: JSON.stringify(searchquery.filter), op: JSON.stringify(searchquery.op)}});

        } else {
            var text = $.trim($(event.currentTarget).val());
            var $field = $(event.currentTarget)[0].id;

            if ($.isEmptyObject(this.filterColumnsPartial)) {
                this.filterColumnsPartial = {};
            }
            if (text) {
                this.filterColumnsPartial[$field] = text;
            } else {
                delete this.filterColumnsPartial[$field];
            }
            this.options.pageNumber = 1;
            this.onSearch(event);
//        this.updatePagination();
            this.trigger('column-common-search', $field, text);
        }
    };
}(jQuery);
