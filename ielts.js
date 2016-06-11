// used https://www.webrtc-experiment.com/msr/audio-recorder.html rather heavily...
$(document).ready(function() {
    function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
                navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
            }
    var mediaConstraints = {audio: true};
    var start = $("#start-recording");
    var stop = $("#stop-recording");
    var pause = $("#pause-recording");
    var resume = $("#resume-recording");
    var mediaRecorder;
    var index = 1;
    var container = $('#audios');
    var timer = $("#timer");
    var left = $("#left");
    var right = $("#right");
    var switcher = $("#switch");
    var helper = $("#helper");
    var cancel = $("#cancel");
    var searcher = $("#search");
    var inSearch = $('#inSearch');
    var topics = ielts.slice();
    var tempArr = [];
    right.height(left.height());
    window.onresize = function(event) {
    right.height(left.height());
};
    var timerer = 0;
    var clock,
        differ,
        showSecs,
        shortSecs,
        flower = 0,//0 - no action, 1 - preparation , 2- recording
        startingText = left.html(),
        indexas,
        cueCard,
        major = false;

    switcher.on("click", function() {
        major = !major;
        helper.toggle();
        if (major) {
            switcher.html('Switch to all topics');
            
        }else{
            switcher.html('Switch to major topics');

        }
    });
    start.on("click", function() {
        cancel.prop('disabled', false);
        searcher.prop('disabled', true);
        inSearch.prop('disabled', true);
        indexas = Math.floor(Math.random()*(topics.length-1));
        //splice used element?
        cueCard = "<b>"+topics[indexas].title+"</b><br/> You should say:<br/> <blockquote><b>"+topics[indexas].questions+"</blockquote></b><br/>";
        flower = 1;
        start.prop('disabled', true);
        left.html (cueCard + "You have one minute to think about what you're going to say. <br/>Use textarea on left for notes, it will be disabled later.");
        right.height(left.height());
        right.prop('disabled', false);
        
        timerer = Math.floor(new Date().getTime()/1000);
        clock = setInterval(function(){
            differ = Math.floor(new Date().getTime()/1000) - timerer;
            shortSecs = differ % 60;
            if (shortSecs<10) {
                shortSecs = "0"+shortSecs;
            }
            showSecs = Math.floor(differ/60) + ":"+shortSecs;
            timer.html(showSecs);
            if (differ>=60 && flower === 1){
                flower = 2;
                timerer = Math.floor(new Date().getTime()/1000);
                left.html (cueCard+ "Time to talk.<br/> Aim for 1.5min at least. Do your best.");
                right.height(left.height());
                right.prop('disabled', true);        
                captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

            }
        }, 1000);
        
    });
    cancel.on("click", function() {
            searcher.prop('disabled', false);
            inSearch.prop('disabled', false);
            stop.prop('disabled', true);
            clearInterval(clock);
            timer.html('0:00');
            left.html (startingText); 
            right.val("");
            right.height(left.height());
            pause.prop('disabled', true);
            start.prop('disabled', false);
            topics = ielts.slice();
            inSearch.val('');
            try{
                mediaRecorder.stop();
                mediaRecorder.stream.stop();
            }
            catch(err){
                
            }

    });
    searcher.on("click", function() {
        if (inSearch.val() !== ''){
            left.html('Now you will be randomized only in topics wich have search item in their question. (Or all if no matches).');
            right.height(left.height());
            for (var i = 0; i < ielts.length; i++) {
                
                if (ielts[i].title.indexOf(inSearch.val()) !== -1) {
                    tempArr.push(ielts[i]);
                } 
            }
            if (tempArr.length>0) {
                topics = tempArr.slice();
                tempArr = [];
            }

        }
    });

    stop.on("click", function() {
            searcher.prop('disabled', false);
            inSearch.prop('disabled', false);
            stop.prop('disabled', true);
            clearInterval(clock);
            timer.html('0:00');
            //left.html (startingText); should it be restored?
            right.val("");
            right.height(left.height());
            pause.prop('disabled', true);
            start.prop('disabled', false);
            mediaRecorder.stop();
            mediaRecorder.stream.stop();
            });

    pause.on("click", function() {
                pause.prop('disabled', true);
                mediaRecorder.pause();
                clearInterval(clock);
                resume.prop('disabled', false);
            });

    resume.on("click", function() {
                resume.prop('disabled', true);
                mediaRecorder.resume();
                timerer = Math.floor(new Date().getTime()/1000)-differ;
                clock = setInterval(function(){
                   differ = Math.floor(new Date().getTime()/1000) - timerer;
                    shortSecs = differ % 60;
                    if (shortSecs<10) {
                        shortSecs = "0"+shortSecs;
            }
            showSecs = Math.floor(differ/60) + ":"+shortSecs;
            
            timer.html(showSecs);
        }, 1000);
                pause.prop('disabled', false);
            }) ;
    
    function onMediaError(e) {
                alert(e);
            }

    function onMediaSuccess(stream) {
                mediaRecorder = new MediaStreamRecorder(stream);
                mediaRecorder.stream = stream;
                mediaRecorder.mimeType = 'audio/wav';
                mediaRecorder.audioChannels = 1;
                mediaRecorder.ondataavailable = function(blob) {
                    if (flower>0) {
                        flower = 0;
                        mediaRecorder.stop();
                        mediaRecorder.stream.stop();
                        stop.prop('disabled', true);
                        clearInterval(clock);
                        timer.html('0:00');
                        pause.prop('disabled', true);
                        start.prop('disabled', false);
                    }
                    var linker = document.createElement('a');
                    var texter = document.createElement('p');
                    texter.innerHTML = '<span>Topic -'+ topics[indexas].title +'(Size: ' + bytesToSize(blob.size) + ') Length: ' +
                    showSecs.split(':')[0] + " minutes and " + showSecs.split(':')[1] + " second(s)"+'</span>';
                    container.append(texter);
                    linker.target = '_blank';
                    linker.innerHTML = 'Open';
                    linker.href = URL.createObjectURL(blob);
                    container.append(linker);
                    var dl = document.createElement('a');
                    dl.target = '_blank';
                    dl.href = linker.href;
                    dl.innerHTML = 'Download'
                    dl.download = 'myspeach.wav';
                    container.append(dl);
                    container.append('<br/>');
                    //left.html (startingText);
                    right.val("");
                    right.height(left.height());
                    
                };
                var timeInterval = 120000;
                mediaRecorder.start(timeInterval);
                stop.prop('disabled', false);
                pause.prop('disabled', false);
                
            }


            $('#genShow').on("click", function() {
                $('#gen').toggle();
            });

            // below function via: http://goo.gl/B3ae8c
            function bytesToSize(bytes) {
                var k = 1000;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes === 0) return '0 Bytes';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
                return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
            }

            
      

            window.onbeforeunload = function() {
                start.prop('disabled', false);
            };            


});


