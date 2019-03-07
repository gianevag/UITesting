$(document).ready(function () {

    //---------------------
    //initial variables
    var incomingColumns = [];
    var msisdn = '';
    var msg = ''
    var delay = 10000;
    var idle = 10;
    var exampleData = { data: {} };
    var initiateTable = true;
    var alreadyExistMsisdn = true;

    var ReconstractionWithTimeInterval = [{}];
    var idleTimeInrval = null;
    var intervalCounter = 0;

    var userDataInit = {};
    var smsIncomingInit = {};
    var smsOutgoingInit = {};
    var apiTransactionsInit = {};

    //form submit
    $('#submit').click(function (e) {

        //FormData
        //handle the message with ajax GET request
        msg = $('input#msg').val();
        delay = $('input#delay').val() * 1000; //delay (sec)
        idle = $('input#idle').val(); //idle (mins)

        //clear all the time intervals 
        clearTimeInterval(ReconstractionWithTimeInterval);

        //clear idle Time Interval
        clearIdleTimeInrval(idle);

        //validation of input
        if ($('input#msisdn').val() == '' || $('input#msg').val() == '') {
            return alert('I need msisdn and msg')
        }

        //check if msisdn already exist as a global variable
        if (msisdn != $('input#msisdn').val()) {
            msisdn = $('input#msisdn').val();
            alreadyExistMsisdn = false;
            userDataInit = {};
            smsIncomingInit = {};
            smsOutgoingInit = {};
            apiTransactionsInit = {};
        }
        else {
            userDataInit = {};
            alreadyExistMsisdn = true;
        }

        //check if it is the first time call with (initiateTable) else we reconstract the table
        if (initiateTable) {
            //initialize the tables here we can put features of the table
            tableConstraction(msisdn, 'gu_main.user_data', '#user_data', function (data) {
                userDataDatatable = $('#user_data').DataTable();
                userDataInit = data;
                //initialize the incomingColumns in order to use it to other tableConstraction function 
                incomingColumns = [];
                tableReconstractionWithTimeInterval(msisdn, 'gu_main.user_data', userDataDatatable, delay);

            });

            tableConstraction(msisdn, 'gu_main.sms_incoming', '#sms_incoming', function (data) {
                smsIncomingDatatable = $('#sms_incoming').DataTable();
                smsIncomingInit = data
                incomingColumns = [];
                tableReconstractionWithTimeInterval(msisdn, 'gu_main.sms_incoming', smsIncomingDatatable, delay);
            });

            tableConstraction(msisdn, 'gu_main.sms_outgoing', '#sms_outgoing', function (data) {
                smsOutgoingDatatable = $('#sms_outgoing').DataTable();
                smsOutgoingInit = data;
                incomingColumns = [];
                tableReconstractionWithTimeInterval(msisdn, 'gu_main.sms_outgoing', smsOutgoingDatatable, delay);
            });

            tableConstraction(msisdn, 'gu_main.api_transactions', '#api_transactions', function (data) {
                apiTransactionsDatatable = $('#api_transactions').DataTable();
                apiTransactionsInit = data;
                incomingColumns = [];
                tableReconstractionWithTimeInterval(msisdn, 'gu_main.api_transactions', apiTransactionsDatatable, delay);
            });

        }
        else {

            tableRecostractionOnceAndWithTimeInterval(msisdn, 'gu_main.user_data', userDataDatatable, false, delay);
            tableRecostractionOnceAndWithTimeInterval(msisdn, 'gu_main.sms_incoming', smsIncomingDatatable, alreadyExistMsisdn, delay);
            tableRecostractionOnceAndWithTimeInterval(msisdn, 'gu_main.sms_outgoing', smsOutgoingDatatable, alreadyExistMsisdn, delay);
            tableRecostractionOnceAndWithTimeInterval(msisdn, 'gu_main.api_transactions', apiTransactionsDatatable, alreadyExistMsisdn, delay);

        }
    });

    var tableRecostractionOnceAndWithTimeInterval = function (msisdn, table, Datatable, alreadyExistMsisdn, delay) {
        if (!alreadyExistMsisdn && typeof Datatable != 'undefined') {
            Datatable.clear();
            tableReconstraction(msisdn, table, Datatable, function () {

                tableReconstractionWithTimeInterval(msisdn, table, Datatable, delay);

            })
        }
        else {
            tableReconstractionWithTimeInterval(msisdn, table, Datatable, delay);
        }
    }

    var tableReconstractionWithTimeInterval = function (msisdn, table, Datatable, delay) {
        ReconstractionWithTimeInterval[intervalCounter] = setInterval(function () {
            console.log('HELLO', msisdn, table);
            tableReconstraction(msisdn, table, Datatable, function (dt) {
                //return cb(dt, ReconstractionWithTimeInterval)
            });
        }, delay);
        intervalCounter++;
    }

    var tableReconstraction = function (msisdn, table, Datatable, cb) {
        ajaxCall(msisdn, table, function (dt) {

            let initDt = getInitializeTables(table);
            initializeTables(table, dt);

            //check the table with upload with length = 1
            if (!jQuery.isEmptyObject(initDt)) {
                if (dt.data.length === 1 && JSON.stringify(initDt.data[0]) !== JSON.stringify(dt.data[0])) {
                    Datatable.rows.add(dt.data);
                    Datatable.draw();
                }
            }

            //check the table with inserts
            if (!isEqualTheLenghtOfData(initDt, dt)) {

                Datatable.rows.add(checkForNewRows(initDt, dt));
                Datatable.draw();
            }
            return cb(dt);
        })
    };

    var checkForNewRows = function (initialData, dt) {
        //let datatabledata = dt.data;
        let datatabledata = {};
        if (!jQuery.isEmptyObject(initialData)) {
            if (dt.data.length - initialData.data.length !== 0) {
                datatabledata = dt.data.slice(initialData.data.length);
            }
        }
        else {
            datatabledata = dt.data;
        }
        return datatabledata
    };

    //check if the initial data length is equal with current data length
    var isEqualTheLenghtOfData = function (initialData, data) {
        let isEqualTheLenghtOfData = false;

        if (!jQuery.isEmptyObject(initialData)) {
            if (initialData.data.length === data.data.length) {
                isEqualTheLenghtOfData = true;
            }
        }
        return isEqualTheLenghtOfData;
    }


    var ajaxCall = function (msisdn, table, cb) {
        $.ajax({
            url: `http://localhost:4000/${msisdn}?table=${table}`,
            type: 'GET',
            success: function (data) {
                if (!jQuery.isEmptyObject(data.data)) {
                    initiateTable = false;
                    return cb(data);
                }
                else {
                    return alert(`Msisdn: ${msisdn} doesn't exist to the ${table} table`);
                }
            }
        })
    };

    //constract the initial table 
    var tableConstraction = function (msisdn, table, selector, cb) {
        ajaxCall(msisdn, table, function (dt) {
            columnContraction(dt.data[0])
            $(selector).DataTable({
                data: dt.data,
                columns: incomingColumns,
                searching: false,
                scrollX: true,
                order: [0, 'desc'],
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
            })
            return cb(dt);
        })
    };

    var columnContraction = function (obj) {
        for (var element in obj) {
            incomingColumns.push({ title: element, data: element });

        }
    };

    var getInitializeTables = function (table) {

        switch (table) {
            case 'gu_main.sms_incoming':
                return smsIncomingInit;
            case 'gu_main.sms_outgoing':
                return smsOutgoingInit;
            case 'gu_main.api_transactions':
                return apiTransactionsInit;
            case 'gu_main.user_data':
                return userDataInit;
            default:
                console.log(`getInitializeTables: may get new initial ${table} table?`)
                break;
        }
    }

    var initializeTables = function (table, dt) {
        switch (table) {
            case 'gu_main.sms_incoming':
                smsIncomingInit = dt;
                break;
            case 'gu_main.sms_outgoing':
                smsOutgoingInit = dt;
                break;
            case 'gu_main.api_transactions':
                apiTransactionsInit = dt;
                break;
            case 'gu_main.user_data':
                userDataInit = dt;
                break;
            default:
                console.log(`initializeTables: may initialize new ${table} table?`)
                break;
        }
    }

    //clear all the time intervals // ReconstractionWithTimeInterval: array{TimeInterval}
    var clearTimeInterval = function (ReconstractionWithTimeInterval) {

        ReconstractionWithTimeInterval.forEach((element, index) => {
            clearInterval(element);
            if (intervalCounter === index + 1) {
                intervalCounter = 0;
            }
        });
    };

    var clearIdleTimeInrval = function (idle) {
        let dateTime = new Date();
        dateTime.setMinutes(dateTime.getMinutes() + parseInt(idle));

        //check if already exist in order to close the interval
        if(idleTimeInrval != null)
        {
            clearInterval(idleTimeInrval);
            console.log(`Stop all the processes after ${idle} minutes`);
        }

        let TimeInrval = setInterval(function () {
            let currentDateTime = new Date();
            if (currentDateTime.getTime() > dateTime.getTime()) {
                clearTimeInterval(ReconstractionWithTimeInterval);
                clearInterval(TimeInrval);
                idleTimeInrval = null;
                console.log(`Stop all the processes after ${idle} minutes`);
            }
        }, 1000);

        idleTimeInrval = TimeInrval;
    }
});