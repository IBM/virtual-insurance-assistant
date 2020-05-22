# Train Watson Discovery using an exported model

If you want to use a free plan of Discovery, you'll need to build your own model.  Follow this tutorial:

- [ ] [Tutorial: Process, understand, and answer policy questions with smart document understanding](https://developer.ibm.com/tutorials/analyze-and-answer-policy-questions-with-smart-document-understanding/)

Although the above tutorial is intended to be a prerequisite for the code pattern, we have also saved an exported model that can be used if you have an `Advanced Plan` instance of Discovery. This is expected to be especially useful if you've done the tutorial already, but want a quicker way to reproduce the results.

### Steps

* You create a paid version of Watson Discovery which will enable you to import the model from the
tutorial. This approach is faster, and you will not have to annotate the insurance document yourself. To do this approach,
first ensure you have a Watson Discovery Advanced plan. This one requires a credit card.
  * Click [here](https://cloud.ibm.com/catalog/services/discovery) to find **Discovery** in the IBM Cloud catalog.
  * `Select a region`.
  * `Select a pricing plan`. Use the `Advanced` plan.
  * Set your `Service name` or use the generated one.
  * Click `Create`.
  * Once you create the service, and then click on the service from the cloud.ibm.com homepage, it should show
`Plan Advanced` in the right hand side of the page, as shown below:

![discovery plan](https://media.github.ibm.com/user/79254/files/78641500-9479-11ea-837a-2c997589c858)

* Next, click on `Launch Watson Discovery` and then create a collection and add in the `data/discovery/sample-insurance.docx` file from
your cloned repo as shown below:

![asdf](https://media.github.ibm.com/user/79254/files/a1997e00-9371-11ea-893c-aa37cb3bde9a)

* Once Watson is done processing the document, click on `Configure data` in the top-right corner of the screen,
as shown below:

![asdf](https://media.github.ibm.com/user/79254/files/a8f77f00-9478-11ea-8962-f98ebeec4e3e)

* Next, click on `Import model` and select the `insurance.sdumodel` file from the `data/discovery` directory in your cloned repo as shown below.

![import](https://media.github.ibm.com/user/79254/files/fb02e680-95d7-11ea-8bd1-de08e0ed4278)

* Once the model is applied, you should see a green notification in the top-right corner of the screen.

### Manage the fields in your document

* Click on the `Manage fields` tab in the upper-left corner of your screen.

* On the left-hand side of the page, under `Identify fields to index`, turn off the `footer` field.

* Next, click on `split document on each occurrence of`, and select `subtitle` so that we split the document by subtitle.

* Lastly, click on `Apply changes to collection` and add in the same `sample-insurance.docx` file you uploaded at first.

* Once your upload is done, you will be taken to the overview page. Refresh your browser to see that Watson is working to split the
documents. After Watson is done, we should have over 10
documents. This is because we have split the original document into multiple, smaller documents based
on the subtitle. This makes retrieving the answer to a particular question a lot easier for Watson,
and enables us to get more accurate enrichments as well, such as sentiment analysis.

![p3](https://media.github.ibm.com/user/79254/files/ca23b100-95d9-11ea-96e9-66d90c651eae)

### Query Watson in natural language

* One of the main benefits of Watson is its ability to answer questions from your document in natural language. Before we do this, let's configure Watson to answer us directly with the text it has analyzed from our insurance document.

* Click on the magnifying glass icon in the sidebar on the left-hand side of the screen. Next click on `more-options` at the bottom of the screen.

* Next, under `Passages` select `No` for `Include relevant passages`.

* Next, under `Documents` for `fields to return` select `text`.

* Lastly, for `Number of documents to return` select `3`.

* Scroll back up to the top of hte page, and under `Search for documents` make sure `Use natural language` is selected. Then ask Watson the following question: `Does my insurance cover glass repairs?`. Once the answer comes back in the top-right corner, `Summary` will be selected. Go ahead and click on `JSON`.

* You should see that Watson will pull out the relevant text from the document that says the insurance company will pay for replacement or repair of the glass in your vehicle's windscreen, sunroof, or windows if the vehicle is lost or damaged.

* Repeat the process for `Does my coverage include medical expenses?` and `Does my insurance cover damage to my vehicle`.

![p4](https://media.github.ibm.com/user/79254/files/559d4200-95da-11ea-8bbf-95cb2397db5a)

Below, you can see the web-application in action, querying Watson in natural language:

![asdf](https://user-images.githubusercontent.com/10428517/82243388-5d1f5c80-98f4-11ea-8b36-f97b7a841aca.gif)

Ask the following questions:

1. Does my insurance cover glass repairs?
2. Does my coverage include medical expenses?
3. Does my insurance cover damage to my vehicle
4. Does my insurance coverage apply for injury to me?
5. Does my insurance cover the cost of my personal belongings damaged in an accident?
6. Does my coverage apply to legal costs?
7. What happens if I get in an accident with an uninsured motorist?
