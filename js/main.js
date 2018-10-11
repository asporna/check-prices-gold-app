(function ($) {
    $(document).ready(function () {
        $(".datepicker").datepicker({
            dateFormat: "yy-mm-dd"
        });

        const btnGetPrice = $("#get-price"),
            formCheckPrice = $(".check-price-form"),
            tableResult = $("#gold-rates-table"),

            ths = tableResult.find("thead th");

        let df = document.createDocumentFragment(),
            tbody = tableResult.find("tbody");

        function validForm(dateFrom, dateTo) {

            let errors = [];
            const startDateObj = new Date(dateFrom),
                endDateObj = new Date(dateTo),

                startDateTime = startDateObj.getTime(),
                endDateTime = endDateObj.getTime(),

                currentDate = new Date(),
            currentDateTime = currentDate.getTime(),

                diff = new Date(endDateTime - startDateTime),
                days = diff / 1000 / 60 / 60 / 24;

            if (dateFrom == "" || dateTo == "") {
                errors.push("Complete all field");
            } else {

                if (startDateTime > currentDateTime) {
                    errors.push("Date given in rate from is higher than curentDate ")
                }

                if (endDateTime > currentDateTime) {
                    errors.push("Date given in rate to is higher than curentDate ");
                }

                if (!(days >= 0 && days <= 93)) {
                    errors.push("You entered an incorrect date range ");
                }

            }

            $(".errors").remove();

            if (errors.length) {

                let divErrors = $("<div></div>").addClass("errors");

                $.each(errors, function (i, el) {
                    $("<p></p>", {
                        "class": "text-error",
                        "text": el
                    }).appendTo(divErrors);
                })

                $(".date-range").append(divErrors);

                return false;
            } else {
                return true;
            }
        }

        function sortByColumn(e) {
            let indexTh = ths.index(e.target),
                sequance = ths.eq(indexTh).hasClass("ascending") ? "descending" : "ascending",
                trs = tableResult.find("tbody tr");

            ths.removeClass();

            trs.sort(function (a, b) {
                var tdA = $(a).children().eq(indexTh).text(),
                    tdB = $(b).children().eq(indexTh).text();

                if (tdA < tdB) {
                    return sequance == "ascending" ? -1 : 1;
                } else if (tdA > tdB) {
                    return sequance == "ascending" ? 1 : -1;
                } else {
                    return 0;
                }
            });

            $.each(trs, function (i, tr) {
                $(df).append(tr);
            })

            tbody.append(df);
            ths.eq(indexTh).addClass(sequance);
        }

        ths.on("click", sortByColumn);

        function getPricesGold(urlReq) {

            function showResult(dataResp) {

                tbody.empty();

                $.each(dataResp, function (index, el) {

                    let newTrBody = $("<tr></tr>");

                    for(let i = 0; i < ths.length; i++) {
                        let newTd = $("<td></td>")
                        newTrBody.append(newTd);
                    }

                    newTrBody.find("td").eq(0).text(el.data);
                    newTrBody.find("td").eq(1).text(el.cena);

                    $(df).append(newTrBody).appendTo(tbody);
                })
            }

            function showSpecificValues(dataResp) {

                let minPriceOutput = $(".min-price output"),
                    maxPriceOutput = $(".max-price output"),
                    medianOutput = $(".median-price output");

                dataResp.sort(function (a, b) {
                    let priceA = a.cena,
                        priceB = b.cena;

                    return priceA - priceB;
                });

                let firstEl = dataResp[0],
                    lastEl = dataResp[dataResp.length - 1],
                    middleLength = dataResp.length / 2,


                    minResult = firstEl.cena + " PLN " + firstEl.data;
                maxResult = lastEl.cena + " PLN " + lastEl.data;
                medianResult = null;

                if (middleLength % 2 == 0) {
                    medianResult = ((dataResp[middleLength - 1].cena + dataResp[middleLength].cena) / 2).toFixed(2) + " PLN ";
                } else {
                    medianResult = dataResp[Math.floor(middleLength)].cena.toFixed(2) + " PLN ";
                }

                minPriceOutput.text(minResult);
                maxPriceOutput.text(maxResult);
                medianOutput.text(medianResult);
            }

            $.ajax({

                "url": urlReq,
                "method": "GET",
                "dataType": "json",
                "success": function (dataResp, status, xhr) {

                    showResult(dataResp);
                    showSpecificValues(dataResp);

                },

                "error": function (xhr, textStatus, thrownError) {

                    console.log(xhr);

                    if (xhr.status == 404) {

                        alert("Page not found");
                    }
                    if (textStatus == 500) {
                        alert('Internal Server Error');
                    }
                }
            });
        }

        btnGetPrice.on("click", function (e) {

            e.preventDefault();

            let dateFrom = formCheckPrice.find("input[name='date-from']").val(),
                dateTo = formCheckPrice.find("input[name='date-to']").val();

            if (validForm(dateFrom, dateTo)) {
                let urlReq = "http://api.nbp.pl/api/cenyzlota/" + dateFrom + "/" + dateTo;
                getPricesGold(urlReq);
            }
        })



    });
})(jQuery);