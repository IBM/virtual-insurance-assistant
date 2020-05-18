# Process, understand, and answer policy questions with Smart Document Understanding 

This tutorial will give you step-by-step instructions on how to use one of the leading AI insight engines as named by Forrester and Gartner in 2019. IBM Watson Discovery, building 
upon IBM research's ground-breaking innovations in natural language processing, machine 
learning, and anomaly detection, will enable you to index business documents and surface 
answers faster, and more accurately than ever.

We will take a sample insurance document, this time by Aviva, ingest it, and use Watson Discovery's built in annotation tool to train Watson on the different sections of a particular 
business document. In this way, we can break the document up, omit certain sections, and improve our accuracy to queries. Used in combination with a chat bot, Watson Discovery is 
used by many organizations to answer complex questions that previously needed a human operator 
to answer, but now can be done due to the power of machine learning. This complex question-answering system not only diverts calls away from your team, but also improves customer experience given that the customer will not have to wait on hold for 10 minutes, and their
question can be answered without picking up the phone. 

The goal of this tutorial will be to ingest our document, and to be able to ask query Watson and 
receive answers about the following questions, directly from our document as shown below.

We want to answer: 

- Does my insurance cover glass repairs?

![glass](https://media.github.ibm.com/user/79254/files/c9d0e900-95cc-11ea-90f0-c5e1b695c5ff)

- Does my insurance cover medical expenses?

![medical](https://media.github.ibm.com/user/79254/files/c76e8f00-95cc-11ea-9529-c61795dd0e57)

- Does my insurance cover damage to my vehicle?

![damage](https://media.github.ibm.com/user/79254/files/ca697f80-95cc-11ea-833a-1de304dcb344)

The tutorial will be broken up into 4 major steps.

1. Create IBM Cloud account and IBM Watson Discovery Service.

2. Create a collection and upload our document to IBM Watson Discovery.

3. Train Watson on our use case - for this example, we will train it on an insurance business that will help Watson answer questions about 
a customer's insurance policy, and what is covered under that policy. 

4. Test our model by asking Watson questions in natural language.

At the end of the tutorial, you, the user, will understand how to use Watson Discovery to quickly annotate, analyze, and answer complex questions based on the documents you feed and 
train Watson on. Not only that, but you will understand how to improve Watson's accuracy by 
using relevancy training, and see that you can extract useful information from your documents such as keywords, locations, entities, and sentiment analysis. 

Let's get started! First, you will need to create an IBM Cloud account. For this tutorial,
you do not need a credit card, and your Cloud account and IBM Watson Discovery service will
be completely free. Use [this link](https://tinyurl.com/y4mzxow5) to create your own IBM Cloud account. 

Use the screen recordings below to help you create your Watson Discovery instance and understand how 
to use the application interface to upload, enrich, and query your data.

## Create your Watson Discovery service 


* Next, log into your IBM Cloud account - once you are logged in, this will take you to the `cloud.ibm.com` homepage.

* In the top search bar - search for `Discovery` and under `Catalog Results`, click on `Discovery`.

* This will take you to the Watson Discovery service creation page, where you can name, choose the pricing tier, and location of your service. 

* Choose the lite tier (the free tier) and choose whichever location you want. Name your service something so you
can easily identify it. I named mine `Discovery-zz`. Next, click the create button in the bottom right corner of 
your screen.

![https://media.github.ibm.com/user/79254/files/54201880-8950-11ea-909f-cc9b771fd446](https://media.github.ibm.com/user/79254/files/9560f100-9370-11ea-8842-70815e4a81c1)


* Go back to the `cloud.ibm.com` homepage by clicking on the IBM Cloud button at the top-left corner of your screen.

* Under `Dashboard` and `Resource Summary`, click on `Services`.

* This will take you to `cloud.ibm.com/resources`. Under `Resource List` and then under `Services` you will see your Watson Discovery instance, with the name you
gave it in the previous steps. Click on that instance.

* This will take you to your instance within IBM Cloud. There you can see your API key, and other details. 
Click on the blue `Launch Watson Discovery` button in the middle of the screen.

* You will be taken the the Watson Discovery service home page, where you can manage your data. This is where 
you will upload the document and data that you want to analyze.

![https://media.github.ibm.com/user/79254/files/54201880-8950-11ea-909f-cc9b771fd446](https://media.github.ibm.com/user/79254/files/220baf00-9371-11ea-9bb2-3613c825d1b2)

## Upload your data  

* From within the main page of Watson Discovery, click on `Upload your own data`. Go ahead and download the `insurance.pdf` file 
which is a sample insurance file we will use to train Watson. It is located in the `sdu_demo` directory.

* This will take a little bit of time to upload your data. When you are done, you will one document in the overview tab at the top left corner of the screen. You should see some sentiment analysis, entity extraction and concept tagging, which comes out of the box as you upload your document.

![https://media.github.ibm.com/user/79254/files/54201880-8950-11ea-909f-cc9b771fd446](https://media.github.ibm.com/user/79254/files/a1997e00-9371-11ea-893c-aa37cb3bde9a)

## Use Smart Document Understanding to annotate your document 



* Next, from the Watson Discovery overview page, click on the `Configure data` button at the top-right of the screen.

* This will take you to the Smart Document Understanding annotation tool. From the right hand side, you have the labels you can label your 
document with. To create custom labels, you must upgrade to the paid version of Watson Discovery.

* We will skip the first five pages of the document, since there is not much useful information in the table of contents and the forward of the 
document.

* On page 6, I first click on the paper icon, next to the magnifying glass on the top bar. That will bring 
me into the `single-page view`. Next, I  use the `Title` field to label the title, and the `subtitle` field 
to highlight all of the subtitles on the page. Optionally, use the `footer` field label to label the page 
number at the bottom of the page. Once we are done, we will click `submit page` in the bottom-right corner 
of the screen.

* The reason we are doing this, is that 
later on when we ask Watson about certain things, such as your cancellation rights, or administration charge, Watson can answer directly 
with this text from the document.

![https://media.github.ibm.com/user/79254/files/bffc3280-906e-11ea-8842-d75b9f78d174](https://media.github.ibm.com/user/79254/files/3ac89480-9372-11ea-9a98-a816ae832b5f)

* Repeat this same process until we reach page 11. 

![page711](https://media.github.ibm.com/user/79254/files/ab6fb100-9372-11ea-8de0-382b13b80287)

## Manage the fields in your document 

* After you have annotated pages 6-11, click on the `Manage fields` tab in the upper-left corner of your screen.

* On the left-hand side of the page, under `Identify fields to index`, turn off the `footer` field.

* Next, click on `split document on each occurrence of`, and select `subtitle` so that we split the document by subtitle.

* Lastly, click on `Apply changes to collection` and add in the same `insurance.pdf` file you uploaded at first. 

* Once your upload is done, you will be taken to the overview page. Refresh your browser to see that Watson is working to split the 
documents. After Watson is done, we should have over 100 
documents. This is because we have split the original document into multiple, smaller documents based 
on the subtitle. This makes retrieving the answer to a particular question a lot easier for Watson,
and enables us to get more accurate enrichments as well, such as sentiment analysis.

![manage-fields](https://media.github.ibm.com/user/79254/files/7152df00-9373-11ea-9093-06343c1794ba)

## Query Watson in natural language

* One of the main benefits of Watson is its ability to answer questions from your document in natural language. Before we do this, let's configure Watson to answer us directly with 
the text it has analyzed from our insurance document.

* Click
on the magnifying glass icon in the sidebar on the left-hand side of the screen. Next 
click on `more-options` at the bottom of the screen.

* Next, under `Passages` select `No` for `Include relevant passages`.

* Next, under `Documents` for `fields to return` select `text`.

* Lastly, for `Number of documents to return` select `3`.

* Scroll back up to the top of hte page, and under `Search for documents` make sure `Use natural language` 
is selected. Then ask Watson the following question: `is glass covered?`. Once the answer comes back
in the top-right corner, `Summary` will be selected. Go ahead and click on `JSON`.

* You should see that Watson will 
pull out the relevant text from the document that says the insurance company will pay for replacement or
repair of the glass in your vehicle's windscreen, sunroof, or windows if the vehicle is lost or damaged.

![QueryWatson](https://media.github.ibm.com/user/79254/files/cf7fc200-9373-11ea-9fd3-7272c7445de1)



* We can query Watson a couple more questions to ensure our model works well. We can ask 
`What is the administration charge?`. Again, we wnat to see the `JSON` answer. You will see that 
Watson responds with the correct text from the document, specifically that it is 18 Euros.

* Lastly, we can ask Watson `What are my cancellation rights?`. Again, the answer should be displayed in 
JSON, and we can see that the principal policyholder has 14 days to cancel from the day of purchase of the 
contract.

![QueryWatson2](https://media.github.ibm.com/user/79254/files/33a28600-9374-11ea-91ad-713a669c3272)

## Integrating Watson Discovery into your application

* Now that you understand how to use Watson Discovery, you may want to use this within your
own application. One common pattern is to use a chat bot, and then trigger the chat bot to search
for answers in Discovery using a Webhook.

* Additionally, if you want to use the natural language processing capabilities that come out-of-the-box
with Watson Discovery, you should check out the examples of using the [Watson Node SDK](https://github.com/watson-developer-cloud/node-sdk), or [any other 
Watson SDK](https://github.com/watson-developer-cloud). 

* As you can see - Watson provides built in sentiment analysis, entity extraction, concept tagging, and other
enrichments you may choose when you click on `configure data`.

* Watson is based on the requirement of `Learning with less`. You saw that within 4 or 5 pages of training,
Watson was able to pick up the subtitles and text very easily from the document.

* To see how to integrate this Watson Discovery document understanding with a chat bot, virtual assistant solution, see our [assistant solution](https://github.ibm.com/ibm-developer-eti-ai-analytics). 

* Thanks for reading :) 


 
