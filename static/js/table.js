var order_id=0
var order_list=[]
var table_data=[]

$( document ).ready(function() {
    // Get html_order_list Today
    $.ajax({
        url: "/html_list/all",
        type: "get",
        contentType: "application/json",
        data: {},
        success: function (response) {
            document.getElementById("order_id").value= response.order_id
            table_data=response.html_order_list
            response.html_order_list=eval(JSON.parse(response.html_order_list))
            $("#html_order_list").html("");

            var not_finish_order=0
            var location_number=0
            var location=['TEST'];
            var location_status="none"

            for (var i = 0; i < response.html_order_list.length ; i++) {
                console.log(response.html_order_list[i])
                if (response.html_order_list[i].status == 0){
                    var status='<span style="color:red; font-weight:700">未完成'
                    not_finish_order+=1
                }
                else{
                    var status='<span style="color:green; font-weight:700">完成'
                }

                location_status='none';
                for (var e = 0; e < location.length ; e++)
                {
                    if (location[e]==response.html_order_list[i].location){
                        location_status='none'
                        break;
                    }
                    else{
                        location_status='add'
                    }
                }

                if (location_status=='add'){
                    location.push(response.html_order_list[i].location)
                    location_number+=1
                }

                $("#html_order_list").append(`<tr class="order_id">
                <td class="col-1">`+response.html_order_list[i]._id+`</td>
                <td class="col-2">`+response.html_order_list[i].year+`-`+response.html_order_list[i].month+`-`+response.html_order_list[i].date+` `+response.html_order_list[i].time+`</td>
                <td class="col-2">`+response.html_order_list[i].location+`</td>
                <td class="col-2">`+response.html_order_list[i].customer+`</td>
                <td class="col-3" data-bs-toggle="modal" data-bs-target="#id_`+response.html_order_list[i]._id+`"><button class="btn btn-primary">查看訂單</button></td>
                <td class="col-1">`+status+`</td>
                <td>無</td>
                </tr>`);
                
                
                var modal_list=Object.entries(response.html_order_list[i].order_list);
                var modal_list_text='';
                for (var r = 0; r < modal_list.length ; r++) {
                        modal_list_text+='<tr><td>'+modal_list[r][0]+'</td><td>'+modal_list[r][1]+'</td></tr>'
                }

                $("#order_number_text").html(response.html_order_list.length+"張");
                $("#not_finish_order_number_text").html(not_finish_order+"張");
                $("#location_number").html(location_number+"個地點");

                console.log(response.html_order_list[i]._id);
                $("#order_modal").append(`
                    <div class="modal fade" id="id_`+response.html_order_list[i]._id+`"tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">訂單編號</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body pb-3">
                            <div class="row">
                                <div class="col">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" placeholder="訂單編號" value="`+response.html_order_list[i]._id+`" disabled>
                                        <label for="floatingPassword">訂單編號</label>
                                    </div>
                                    <div class="form-floating mb-3 mt-4">
                                        <input type="text" class="form-control" placeholder="送達時間" value="`+response.html_order_list[i].year+`-`+response.html_order_list[i].month+`-`+response.html_order_list[i].date+` `+response.html_order_list[i].time+`" disabled>
                                        <label for="floatingInput">送達時間</label>
                                    </div>
                                    <div class="form-floating mb-3 mt-4">
                                        <input type="text" class="form-control" placeholder="地點" value="`+response.html_order_list[i].location+`" disabled>
                                        <label for="floatingInput">地點</label>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" placeholder="議員" value="`+response.html_order_list[i].customer+`" disabled>
                                        <label for="floatingPassword">議員</label>
                                    </div>        
                                    <table class="table" style="font-size: medium;">
                                        <thead>
                                        <tr>
                                            <th scope="col">商品名稱</th>
                                            <th scope="col">數量</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        `+modal_list_text+`
                                        </tbody>
                                    </table>
                                    </div>
                            </div>  
                        </div>
                        <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="send_order">送出</button>
                        </div>
                    </div>
                    </div>
                </div>`)
              }    
        }   
    })

    //get specific date order
    $("#search_button").click(function() {
        if (document.getElementById("search_list").value == '_id'){
            var search_function='_id'+document.getElementById("search_input").value;
            // var search_key=document.getElementById("search_input").value;
        }
        
        else if(document.getElementById("search_list").value == 'date'){
            var search_function=document.getElementById("search_input").value;
            // var search_key=document.getElementById("search_input").value;
        }

        else if(document.getElementById("search_list").value == 'all'){
            var search_function='all';
            // var search_key=document.getElementById("search_input").value;
        }

        else if(document.getElementById("search_list").value == 'today'){
            var search_function='today';
            // var search_key=document.getElementById("search_input").value;
        }
        else{
            alert('請先選擇搜尋方法')
        }

        $.ajax({
            url: "/html_list/"+search_function,
            type: "get",
            contentType: "application/json",
            data: {
                // search_key:search_key
            },
            success: function (response) {
                document.getElementById("order_id").value= response.order_id
                table_data=response.html_order_list
                response.html_order_list=eval(JSON.parse(response.html_order_list))
                $("#html_order_list").html("");
    
                var not_finish_order=0
                var location_number=0
                var location=['TEST'];
                var location_status="none"
    
                for (var i = 0; i < response.html_order_list.length ; i++) {
                    console.log(response.html_order_list[i])
                    if (response.html_order_list[i].status == 0){
                        var status='<span style="color:red; font-weight:700">未完成'
                        not_finish_order+=1
                    }
                    else{
                        var status='<span style="color:green; font-weight:700">完成'
                    }
    
                    location_status='none';
                    for (var e = 0; e < location.length ; e++)
                    {
                        if (location[e]==response.html_order_list[i].location){
                            location_status='none'
                            break;
                        }
                        else{
                            location_status='add'
                        }
                    }
    
                    if (location_status=='add'){
                        location.push(response.html_order_list[i].location)
                        location_number+=1
                    }
    
                    $("#html_order_list").append(`<tr class="order_id">
                    <td class="col-1">`+response.html_order_list[i]._id+`</td>
                    <td class="col-2">`+response.html_order_list[i].year+`-`+response.html_order_list[i].month+`-`+response.html_order_list[i].date+` `+response.html_order_list[i].time+`</td>
                    <td class="col-2">`+response.html_order_list[i].location+`</td>
                    <td class="col-2">`+response.html_order_list[i].customer+`</td>
                    <td class="col-3" data-bs-toggle="modal" data-bs-target="#id_`+response.html_order_list[i]._id+`"><button class="btn btn-primary">查看訂單</button></td>
                    <td class="col-1">`+status+`</td>
                    <td>無</td>
                    </tr>`);
                    
                    
                    var modal_list=Object.entries(response.html_order_list[i].order_list);
                    var modal_list_text='';
                    for (var r = 0; r < modal_list.length ; r++) {
                            modal_list_text+='<tr><td>'+modal_list[r][0]+'</td><td>'+modal_list[r][1]+'</td></tr>'
                    }
    
                    $("#order_number_text").html(response.html_order_list.length+"張");
                    $("#not_finish_order_number_text").html(not_finish_order+"張");
                    $("#location_number").html(location_number+"個地點");
    
                    console.log(response.html_order_list[i]._id);
                    $("#order_modal").append(`
                        <div class="modal fade" id="id_`+response.html_order_list[i]._id+`"tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">訂單編號</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body pb-3">
                                <div class="row">
                                    <div class="col">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" placeholder="訂單編號" value="`+response.html_order_list[i]._id+`" disabled>
                                            <label for="floatingPassword">訂單編號</label>
                                        </div>
                                        <div class="form-floating mb-3 mt-4">
                                            <input type="text" class="form-control" placeholder="送達時間" value="`+response.html_order_list[i].year+`-`+response.html_order_list[i].month+`-`+response.html_order_list[i].date+` `+response.html_order_list[i].time+`" disabled>
                                            <label for="floatingInput">送達時間</label>
                                        </div>
                                        <div class="form-floating mb-3 mt-4">
                                            <input type="text" class="form-control" placeholder="地點" value="`+response.html_order_list[i].location+`" disabled>
                                            <label for="floatingInput">地點</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" placeholder="議員" value="`+response.html_order_list[i].customer+`" disabled>
                                            <label for="floatingPassword">議員</label>
                                        </div>        
                                        <table class="table" style="font-size: medium;">
                                            <thead>
                                            <tr>
                                                <th scope="col">商品名稱</th>
                                                <th scope="col">數量</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            `+modal_list_text+`
                                            </tbody>
                                        </table>
                                        </div>
                                </div>  
                            </div>
                            <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="send_order">送出</button>
                            </div>
                        </div>
                        </div>
                    </div>`)
                  }    

                  fundotest();
                  console.log('reload_function');
            }   
        })
    });





    $("#finish").click(function() {
        if(order_id == '0'){alert('【請先點選訂單!】');}

        else{
            $.ajax({
                url: "/finish_order/"+order_id,
                type: "get",
                contentType: "application/json",
                data: {},
                success: function (response) {
                    if (response.name!='none'){
                        $.ajax({
                            url: "/notify",
                            type: "get",
                            contentType: "application/json",
                            data: {
                                name:response.name,
                                text:response.text
                            },
                            success: function (response) {
    
                            }   
                        }) 
                    }
                    alert('完成訂單')
                    window.location.replace("/");
                }   
            }) 
        }
    });

    $("#delete").click(function() {
        if(order_id == '0'){alert('請先點選訂單!');}

        else{
            $.ajax({
                url: "/delete_order/"+order_id,
                type: "get",
                contentType: "application/json",
                data: {},
                success: function (response) {
                    alert('刪除訂單')
                    window.location.replace("/");
                }   
            }) 
        }
    });

    $("#add_item").click(function() {
        if (document.getElementById("item_list").value != '請選擇商品'){
            if (order_list.length != 0){
                for (var i = 0; i < order_list.length ; i++) {
                    if (order_list[i].item == document.getElementById("item_list").value){
                        order_list[i].number+=parseInt(document.getElementById('number').value)
                        var status="changed"
                        break;
                    }
                  }    
                if (status!="changed"){
                    order_list.push({item:document.getElementById("item_list").value,number:parseInt(document.getElementById('number').value)});
                }
    
            }
            else{
                order_list.push({item:document.getElementById("item_list").value,number:parseInt(document.getElementById('number').value)});
            }
            $("#table_body").html("");
            for (var i = 0; i < order_list.length ; i++) {
                var number=i+1
                $("#table_body").append(`<tr><th scope="row">`+number+`</th><td>`+order_list[i].item+`</td><td>`+order_list[i].number+`</td></tr>`)
                }

        }
        else{
            alert('【請先選擇商品】');
        }

 
    });

    $("#send_order").click(function() {
        if (order_list.length != 0){
            order_detail=[]
            order_detail.push({order_time:document.getElementById("order_time").value,location:document.getElementById("location").value,customer:document.getElementById("customer").value})
            $.ajax({
                url: "/send_order/"+JSON.stringify(order_list)+'/'+JSON.stringify(order_detail),
                type: "post",
                contentType: "application/json",
                data: {},
                success: function (response) {
                    alert('【訂單新增成功】');
                    window.location.replace("/");
                }   
            })    
        }

        else{
            alert('請先加入商品')
        }
        

    });

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

  function fundotest(){
    // alert('success')
    $("#infoTable tbody tr").click(function() {
        var selected = $(this).hasClass("highlight");
        order_id =this.querySelector('td:first-child').innerText;
        // console.log(order_id.innerText)
        $("#infoTable tr").removeClass("highlight");
        if (!selected)
        $(this).addClass("highlight");
    });
  }

  window.onload = function(){
	setTimeout(fundotest,1000);
}

