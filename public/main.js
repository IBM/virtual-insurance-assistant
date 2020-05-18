/* Copyright IBM Corp. 2018
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var data = null;

var form1 = document.getElementById('form1');
form1.onsubmit = submit;
var form2 = document.getElementById('form2');
form2.onsubmit = submit;

var selectTask = document.querySelector(".js-select1");

var chatTask = document.querySelector(".js-chat");
var claimTask = document.querySelector(".js-claim");
var policyTask = document.querySelector(".js-policy");

var container = document.querySelector(".js-container");

var backgroundImg = document.querySelector(".hero");
var backgroundIdx = -1;

function switchImages(){
  var backgroundImages = [
    "url('./img/support_during_hurricane_harvey_tx_50.jpg')",
    "url('./img/Barcroft_1300_Thomas_St_Car_Damaged_By_Tree_7536694126.jpg')",
    "url('./img/forest-fire-1493436144fp6.jpg')",
    "url('./img/default.jpeg')",
  ];

  backgroundIdx = ++backgroundIdx % backgroundImages.length;
  backgroundImg.style.backgroundImage = backgroundImages[backgroundIdx];
}

function doSelectTask() {
  switchImages();
  window.scrollTo(0, 0);

  var selectedTask = (selectTask && selectTask.value) ? selectTask.value : '';

  chatTask.style.display = ( selectedTask === "chat" ? "" : "none");
  claimTask.style.display = ( selectedTask === "claim" ? "" : "none");
  policyTask.style.display = ( selectedTask === "policy" ? "" : "none");

  if ( selectedTask !== '' ) {
    container.classList.add("is-selected");
  }
  else {
    container.classList.remove("is-selected");
  }
}

function submit(event) {
  event.preventDefault();
  container.classList.remove("is-selected");
}
