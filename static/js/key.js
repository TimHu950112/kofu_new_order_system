var order_id=0
var order_list=[]

$( document ).ready(function() {
    $.ajax({
        url: "/key_setting/get_key",
        type: "get",
        contentType: "application/json",
        data: {},
        success: function (response) {
            response.data=JSON.parse(response.data)

            for (var i = 0; i < response.data.length ; i++){
                $('#table_list').append('<tr><td>'+response.data[i].name+'</td><td>'+response.data[i].key+'</td><td>'+JSON.stringify(response.data[i].user)+'<td></tr>')
            }
            // $("#table_list").append('')
        }   
    }) 

    $(".download_excel").click(function() {
        console.log('clicked')
        console.log($(this).attr("id"))
        $.ajax({
            url: "/download_excel/"+$(this).attr("id"),
            type: "get",
            contentType: "application/json",
            data: {
                table_data:table_data
            },
            success: function (response) {
                var downloadLink = document.createElement('a');
                downloadLink.href = response.download_url;
                downloadLink.download = "出貨報表.xlsx"; // 在這裡設定你想要的檔名
                downloadLink.click();
            }   
        }) 
    });
 });




