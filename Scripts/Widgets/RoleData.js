$(document).ready(function () {

    //Roles available, ID is their value
    var roles = [
        { Name: "", id: 0 },
        { Name: "waldoCON", id: 1 },
        { Name: "waldoOPM", id: 2 }
    ];

    var requestorGroups = [
        { Name: "", id: "" },
        { Name: "OSP-CONSTR-SW", id: "OSP-CONSTR-SW" },
        { Name: "OSP-CONSTR-Tech-MWE", id: "OSP-CONSTR-Tech-MWE" },
        { Name: "OSP-CONSTR-Tech-SWN", id: "OSP-CONSTR-Tech-SWN" },
        { Name: "OSP-CONSTR-MW", id: "OSP-CONSTR-MW" },
        { Name: "OSP-CONSTR-Tech-W1", id: "OSP-CONSTR-Tech-W1" },
        { Name: "OSP-CONSTR-Tech-SEE1", id: "OSP-CONSTR-Tech-SEE1" },
        { Name: "OSP-CONSTR-SE", id: "OSP-CONSTR-SE" },
        { Name: "OSP-CONSTR-Tech-SWS", id: "OSP-CONSTR-Tech-SWS" },
        { Name: "OSP-CONSTR-Tech-W2", id: "OSP-CONSTR-Tech-W2" },
        { Name: "OSP-CONSTR-Tech-SEW", id: "OSP-CONSTR-Tech-SEW" },
        { Name: "OSP-CONSTR-Tech-MWW", id: "OSP-CONSTR-Tech-MWW" },
        { Name: "OSP-CONSTR-Tech-SEE2", id: "OSP-CONSTR-Tech-SEE2" },
        { Name: "OSP-CONSTR-Tech-SEE3", id: "OSP-CONSTR-Tech-SEE3" },
        { Name: "OSP-CONSTR-W", id: "OSP-CONSTR-W" }
    ];

    //Method to parse the CSV Data
    function parseCSVData(file) {
        var data = $.csv.toObjects(file);
        data.forEach(function (item, indx) {
            //Convert the roles into their code value, so that the selects properly populate
            roles.some(function (role) {
                if (role.Name == item.ROLE_CD) {
                    item.ROLE_CD = role.id;
                    return true;
                }
            });
            //Assign an index on the items
            item.ID = indx + 1;
            //Display duplicates in the console
            //if (!!indx && item.ATTUID == data[indx - 1].ATTUID) {
            //    console.log(item.ATTUID);
            //}
        });

        return data;
    }

    //Attach listener to file drop area
    var dropArea = $('#RoleDataDropArea');
    //Use Filedrop: https://github.com/weixiyen/jquery-filedrop
    dropArea.filedrop({
        //Fallback ID for Browse button to allow users to search filesystem instead
        fallback_id: "roleDataInput",
        allowedfileextensions: ['.csv'],
        paramname: 'files',
        maxfiles: 1,
        maxfilesize: 5, // in MB
        overClass: 'alert-info',
        decodebase64: true,
        dragOver: function () {
            dropArea.addClass("alert-info").removeClass("alert-secondary");
        },
        dragLeave: function () {
            dropArea.addClass("alert-secondary").removeClass("alert-info");
        },
        drop: function () {
            dropArea.addClass("alert-secondary").removeClass("alert-info");
        },
        afterAll: function () {
            dropArea.html('The file has been uploaded successfully! Processing data. You should see it shortly.');
        },
        uploadFinished: function (i, file, response, time) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                var csv = event.target.result;
                $("#roleModalLoadIndicator").removeClass("hidden");
                createUserDataTable(parseCSVData(csv));
            }
        }
    });

    var currData = [];

    function createUserDataTable(data) {
        //console.log(data);
        currData = data;
        $("#roleModalLoadIndicator").removeClass("hidden");

        $("#roleModal").one("shown.bs.modal", function () {
            $("#roleModalBody").jsGrid({
                width: "100%",
                height: "500px",

                inserting: false,
                editing: true,
                sorting: true,
                filtering:true,
                paging: false,

                data: currData,

                fields: [
                    { name: "ID", editing: false, type: "number", width: "10%", filtering:false },
                    { name: "ATTUID", type: "text", width: "10%", validate: "required" },
                    { name: "LAST_LOGIN_DATE", filtering:false, title: "Last Login", type: "text", width: "20%", editing: false },
                    {
                        name: "ACTIVE_YN", title: "Active", type: "text", width: "10%", validateConfig: {
                            validator: function (value) {
                                return (value !== "Y" || value !== "N");
                            },
                            message: "Active must equal 'Y' or 'N'"
                        }
                    },
                    { name: "ROLE_CD", title: "Role", type: "select", items: roles, valueField: "id", textField: "Name", width: "15%" },
                    { name: "Requestor Group", type: "select", items: requestorGroups, valueField: "id", textField: "Name", width: "25%" },
                    { type: "control", width: "10%" }
                ],
                onRefreshed: function () {
                    $("#roleModalLoadIndicator").addClass("hidden");
                    $("#roleModalItemCounter").html(currData.length);
                },
                onItemInserted: function (args) {
                    //Scroll to the bottom of the grid
                    args.grid._body.scrollTop(args.grid._body[0].scrollHeight);
                },
                controller: {
                    data: currData,
                    loadData: function (filter) {
                        //This function handles the filtering
                        return $.grep(this.data, function (item) {
                            //Set our default to a match being found
                            var match = true;
                            //Iterate through each filter
                            for (key in filter) {
                                //Check if the filter is the default value, if not, identify if the value exists or not
                                if ((filter[key] !== "" && filter[key] != 0) && item[key].indexOf(filter[key]) == -1) {
                                    //No match, set to false and break out of the loop
                                    match = false;
                                    break;
                                }
                            }
                            return match;
                        });
                    },
                }
            });
            //HACK: refresh, so that the grid is the right height when the modal is showing
            $("#roleModalLoadIndicator").removeClass("hidden");
            setTimeout(function () {
                $("#roleModalBody").jsGrid("refresh");
            }, 10);
        }).modal("show");

        
    }

    //Setup listener on add button so user can add entries if they need to.
    $("#roleModalInsertButton").click(function () {
        $("#roleModalLoadIndicator").removeClass("hidden");

        var currTime = new Date(),
            newItem = {
                ID: currData.length + 1,
                ATTUID: "",
                LAST_LOGIN_DATE: currTime.toLocaleDateString() + " " + currTime.getHours() + ":" + currTime.getMinutes(),
                ACTIVE_YN: "",
                ROLE_CD: 0,
                "Requestor Group": 0
            };

        setTimeout(function () {
            $("#roleModalBody").jsGrid("insertItem", newItem);
        }, 10);        
    });

    //Setup listener for save changes button
    $("#roleModalSaveButton").click(function () {
        //Do save stuff
        $("#roleModal").modal("hide");
    });

    //Setup a confirmation dialog so that the user doesn't accidentally close the editor and lose their work
    $('.closefirstmodal').click(function () {
        $('#Warning').on('show.bs.modal', function () {
            $('.confirmclosed').click(function () {
                $('#Warning').modal('hide');
                $('#roleModal').modal('hide');
            });
        }).modal('show');
    });

    //Setup listener that resets the input to allow the user to use it again.
    $("#roleModal").on("hide.bs.modal", function () {
        //Reset the file upload input
        $("#roleDataInput").val(null);
        currData = [];
        dropArea.html("Drag a file here to modify multiple users.");
    });
});