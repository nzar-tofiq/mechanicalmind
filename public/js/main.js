$(document).ready(function() {
  // $.ajaxSetup({
  //   xhrFields: {withCredentials: true},
  //   error: function(xhr, status, error) {
  //     $('.alert').removeClass('hidden');
  //     $('.alert').html("Status: " + status + ", error: " + error);
  //   }
  // });
  //
  // //list of all the callback option for fileupload module
  // //https://github.com/blueimp/jQuery-File-Upload/wiki/Options
  // $('.quizparams, .quizdefaults').hide();
  // $('#fileupload').fileupload({
  //   done: function(event, data) {
  //     console.log(data.result);
  //     $('.uploadfile').hide();
  //     $('.quizparams').show();
  //     //$('.quizparams input').val(data.result.originaldirname + '/');
  //     if(!data.result._id){
  //       $(location).attr('pathname', 'login')
  //     }
  //     $('.expid').html('id: ' + data.result._id);
  //     $('input[name="quizid"]').val(data.result._id);
  //   },
  //   progressall: function (e, data) {
  //     var progress = parseInt(data.loaded / data.total * 100, 10);
  //     $('.progress-bar').css('width', progress + '%');
  //   }
  // });
});
