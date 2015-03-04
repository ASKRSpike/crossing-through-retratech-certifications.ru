// ==UserScript==
// @name         RetratechPasser
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http://certifications.ru/*
// @grant        none
// ==/UserScript==
QAArr = [
[' Что означает отмеченное на следующем изображении число?<br><br><img src="/static/images/tests/113_4f7882979c90e.jpg" alt=""> ',
[
'Текущее положение курсора',
'Текущий размер инструмента \\(например, кисти\\)',
'Другое',
'Текущий шрифт',
'Текущий масштаб',
],
[],
['radio']
],
[' Какие горячие клавиши или комбинации клавиш из предложенных в Adobe Photoshop вызывает инструмент "Текст"? ',
[
'T',
'Ctrl\\+T',
'Shift\\+T',
'Ctrl\\+Tab',
'Alt\\+T',
],
['' ,'' ,'' ],
['checkbox']
],
];

testURL = 'http://certifications.ru/tests/new/id/113/';
// сочетания по 3 и по 2 из 5 
chkAnswersVar = [
    [2, 3, 4], //00111
    [1, 3, 4], //01011
    [1, 2, 4], //01101
    [1, 2, 3], //01110
    [0, 3, 4], //10011
    [0, 2, 4], //10101
    [0, 2, 3], //10110
    [0, 1, 4], //11001
    [0, 1, 3], //11010
    [0, 1, 2], //11100
    [3, 4], //00011
    [2, 4], //00101
    [2, 3], //00110
    [1, 4], //01001
    [1, 3], //01010
    [1, 2], //01100
    [0, 4], //10001
    [0, 3], //10010
    [0, 2], //10100
    [0, 1] //11000
];

a = '';
questionFound = false;

//с массивом ответов
function SetAnswer(answer) {
    for (var i = 0; i < answer.length; i++) {
        //поиск настоящего id
        //console.log('answer[i] = ' + answer[i]);
//console.log('a = ' + a);
        id_pos = a.search(answer[i] + '<\\/label>');

        if (answer[i].length < 2) {
            id_pos = a.search('">'+answer[i] + '<\\/label>')+2;
        }

        real_id = a.substring(id_pos - 3, id_pos - 2);
        document.getElementById('fansw' + real_id).checked = true;
    }
}

function SendAnswer() {
    mybutton = document.getElementsByClassName('send-answer button-blue-small')[0];
    if (mybutton !== undefined) {
        mybutton.click();
    }
}

function StartTest() {
    mybutton = document.getElementsByClassName('button-blue-long start-testing')[0];
    if (mybutton !== undefined) {
        mybutton.click();
    }
}

function mysec() {
    StartTest();
    CurrentQuestionString = localStorage.CurrentQuestionString;
    CurrentAnswerString = localStorage.CurrentAnswerString;
    CurrentChkAnswerString = localStorage.CurrentChkAnswerString;
    if (CurrentQuestionString === undefined) {
        localStorage.CurrentQuestionString = '0';
    }
    if (CurrentAnswerString === undefined) {
        localStorage.CurrentAnswerString = '0';
    }
    if (CurrentChkAnswerString === undefined) {
        localStorage.CurrentChkAnswerString = '0';
    }
    CurrentQuestionIndex = parseInt(CurrentQuestionString);
    CurrentAnswerIndex = parseInt(CurrentAnswerString);
    CurrentChkAnswerIndex = parseInt(CurrentChkAnswerString);


    if (CurrentQuestionIndex >= QAArr.length) {
        clearInterval(intervalId);
        alert('ALL FINISHED!');
        console.log('ALL FINISHED!');
        localStorage.CurrentQuestionString = '0';
        return;
    }
    if (CurrentAnswerIndex >= QAArr[CurrentQuestionIndex][1].length) {
        localStorage.CurrentAnswerString = 0;
        SendAnswer();
    }
    if (CurrentChkAnswerIndex >= chkAnswersVar.length) {
        localStorage.CurrentChkAnswerString = 0;
        SendAnswer();
    }
    // колбасим текущий вопрос
    MyDomWindow = document.getElementsByClassName('d-wrapper')[0].innerHTML;
    start = MyDomWindow.search("body"); //<div class="body">
    end = MyDomWindow.search("form"); //<form id="test-answers">
    q = MyDomWindow.slice(start + 6, end - 1);
    q = q.replace(/\s{2,}/g, ' ');
    q = q.replace(/\r\n|\r|\n/g, ''); //переносы строк в жопу                
    formend = MyDomWindow.search("Поставить тест на паузу после данного вопроса");
    a = MyDomWindow.slice(end + 39, formend - 82); // подкорректировать, чтобы первый div не срезать
    a = a.replace(/\s{2,}/g, ' ');

    if (q == QAArr[CurrentQuestionIndex][0]) {
        questionFound = true;
        if (QAArr[CurrentQuestionIndex][3] == 'radio') {
            SetAnswer([QAArr[CurrentQuestionIndex][1][CurrentAnswerIndex]]);
        } else {
            if (chkAnswersVar[CurrentChkAnswerIndex].length == 2) {
                SetAnswer([QAArr[CurrentQuestionIndex][1][chkAnswersVar[CurrentChkAnswerIndex][0]], QAArr[CurrentQuestionIndex][1][chkAnswersVar[CurrentChkAnswerIndex][1]]]);
            } else {
                SetAnswer([QAArr[CurrentQuestionIndex][1][chkAnswersVar[CurrentChkAnswerIndex][0]], QAArr[CurrentQuestionIndex][1][chkAnswersVar[CurrentChkAnswerIndex][1]], QAArr[CurrentQuestionIndex][1][chkAnswersVar[CurrentChkAnswerIndex][2]]]);
            }
        }
    }
    SendAnswer();
    if (MyDomWindow.search("Результаты сертификации") != -1) {
        ratePos = MyDomWindow.search("Баллы:");
        rate = MyDomWindow.slice(ratePos + 10, ratePos + 14);
        // условие успеха - вопрос найден и результат больше ноля
        if (questionFound) {
            if (parseInt(rate) > 0) {
                //console.log('correct answer is ' + CurrentAnswerIndex);
                if (QAArr[CurrentQuestionIndex][3] == 'radio') {
                    outStr = '[\'' + QAArr[CurrentQuestionIndex][0] + '\',\n[\n\'' + QAArr[CurrentQuestionIndex][1][0] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][1] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][2] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][3] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][4] + '\'\n],\n[' + CurrentAnswerIndex + ']\n[\'' + QAArr[CurrentQuestionIndex][3] + '\']\n],\n';
                    localStorage.CurrentAnswerString = 0;
                } else {
                    outStr = '[\'' + QAArr[CurrentQuestionIndex][0] + '\',\n[\n\'' + QAArr[CurrentQuestionIndex][1][0] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][1] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][2] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][3] + '\',\n\'' + QAArr[CurrentQuestionIndex][1][4] + '\'\n],\n[' + chkAnswersVar[CurrentChkAnswerIndex] + ']\n[\'' + QAArr[CurrentQuestionIndex][3] + '\']\n],\n';
                    localStorage.CurrentChkAnswerString = 0;
                }
                outStr = outStr.replace(/\\/g, '\\\\');
                outStr = '';
                localStorage.CurrentQuestionString = CurrentQuestionIndex + 1;
     			
            } else {
                //console.log('wrong answer is ' + QAArr[CurrentQuestionIndex][1][CurrentAnswerIndex]);
                if (QAArr[CurrentQuestionIndex][3] == 'radio') {
                    localStorage.CurrentAnswerString = CurrentAnswerIndex + 1;
                } else {
                    localStorage.CurrentChkAnswerString = CurrentChkAnswerIndex + 1;
                }
            }
            // выяснив правильность или неправильность ответа можно что-то сделать, например перейти к следующему вопросу
        }
        clearInterval(intervalId);
        location.href = testURL; // ищем вопрос до победного, с неправильным вопросом бесконеная перегрузка страницы
    }


}

//localStorage.CurrentQuestionString = '0';
intervalId = setInterval(mysec, 100);