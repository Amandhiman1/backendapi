const db = require("../models");
const Webpages = db.webpages;
const Cities = db.cities;
const Countries = db.countries;
const Airlines = db.airlines;
const Airports = db.airports;
const Page_types = db.page_types;
function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

function splitArray(arr, chunkSize) {
  var result = [];
  for (var i = 0; i < arr.length; i += chunkSize) {
    var chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

async function forloop(collection_name,matches,title,body,lang="en",slug,newdata={}){
    let arrayToInsert = []
    let langObj = {"en":"english","es":"spanish"}
    let data = await collection_name.find().limit(4)

    //console.log(data,matches)

    for await (const myvar of data) {

      /* if(matches=='%airline%') {
        eng_name = myvar.airline_name
      } else eng_name = myvar.english */

      if(matches=='%airline%') {
        eng_name = myvar.airline_name
      } else eng_name = myvar[langObj[lang]]

      const originalString = title;
      const searchVariable = matches;
      const replacementValue = eng_name;
      //console.log(originalString,searchVariable,replacementValue)

      const modifiedString = originalString.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue);
      //console.log(modifiedString);
      let url = convertToSlug(slug.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue))+'.html'
      var exists = await Webpages.find({'slug':url}).then(async function (result){
            //console.log('result',result)
            return await result;         
        });   
        
      if(exists.length==0){

        //console.log('ndata222',newdata)

        let ndata = convertToData(newdata,searchVariable,replacementValue)
        //console.log('ndata333',ndata)
        var singleRow = {
            category: body.category,
            page_type: body.page_type_id,
            title: modifiedString,
            data: ndata,
            lang: lang,
            slug: url,
        };
        arrayToInsert.push(singleRow);   
      }       

    }      
    return arrayToInsert;
}

// Function to check if any string in the first array exists as a substring in any of the elements of the second array (array of nodes)
function isAnyStringExistInArrayNode(stringArray, nodeObject) {
  let narr = []
    for (const property in nodeObject) {
      if (typeof nodeObject[property] === 'string') {
        for (const searchString of stringArray) {
          if (nodeObject[property].includes(searchString)) {
            narr.push(searchString) // Found a string that exists as a substring in the array of nodes
          }
        }
      }
    }

    if(narr.length>0) {
      return narr.filter(function(item, pos) {
          return narr.indexOf(item) == pos;
      }); 
    }else return false; 
}


function convertToData(nodeObject,searchVariable,replacementValue) {
  let nobj = {}
    for (const property in nodeObject) {
      if (typeof nodeObject[property] === 'string') {
        nobj[property] = nodeObject[property].replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue)        
      }
    }
   return nobj; 
}


exports.create = async (req, res) => {
  if (!req.body.page_type || !req.body.category) {
    res.status(400).send({ message: "category and page_type can not be empty!" });
    return;
  }
  let categories = ['%city%','%country%','%airline%','%airport%']

  //console.log(req.body); 
  
  let pageslugs = await Page_types.findOne({'_id':req.body.page_type_id});

  //console.log(pageslugs.languages, typeof pageslugs.languages[0],Object.keys(pageslugs.languages[0]).length,Object.keys(req.body.data).length);

  let slugs = {};

  if(pageslugs.languages && pageslugs.languages.length>0 && Object.keys(pageslugs.languages[0]).length>0 && Object.keys(req.body.data).length>0){

    for await(let  key of Object.keys(req.body.data)) {

      console.log(req.body.data[key], pageslugs.languages[0][key])

      if(req.body.data[key].slug){
        slugs[key] = req.body.data[key].slug;
      }else if(pageslugs.languages[0][key]){
        slugs[key] = pageslugs.languages[0][key];
      }else {
        slugs[key] = req.body.page_type;
      }

    }

  }else if(Object.keys(req.body.data).length>0){

    for await (let key of Object.keys(req.body.data)) {
      if(req.body.data[key].slug!==""){
        slugs[key] = req.body.data[key].slug;
      }else{
        slugs[key] = req.body.page_type;
      }

    }   
    
  }else{
    slugs['en'] = req.body.page_type;
  }
  //return;

  //let array = req.body.page_type.split(' ')
  
  const slugObj = {};
  for await (let key of Object.keys(slugs)) {
    console.log(slugs[key]);
    //const re = isAnyStringExistInArrayNode(categories, slugs[key]);
    
    let narr = []
    if (typeof slugs[key] === 'string') {
      for await (const searchString of categories) {
        if (slugs[key].includes(searchString)) {
          narr.push(searchString) // Found a string that exists as a substring in the array of nodes
        }
      }
    }

    slugObj[key] = narr;
  }
  /* for (let i = 0; i < array.length; i++) {
    if(categories.indexOf(array[i]) !== -1){
      matches.push(array[i]);
    }
  } */
  
  let body_arr = {}
  for await (let key of Object.keys(req.body.data)) {
    //console.log(key,req.body.data[key]); 
    const result = isAnyStringExistInArrayNode(categories, req.body.data[key]);
    //console.log(result);
    let arra;
    if(slugObj[key].length>0 && result.length>0) {
        //slugObj.filter(x => slugObj[key].includes(x));
        //arra = result.filter(x => !slugObj[key].includes(x)).concat(slugObj[key].filter(x => !result.includes(x)));

        arra = result.filter(x => !slugObj[key].includes(x))
        //console.log('result',arra, slugObj[key]);
    }

    body_arr[key] = arra;

  }
  //console.log('slugObj',slugObj, body_arr);


  let catobj = {'%city%':Cities,'%country%':Countries,'%airline%':Airlines,'%airport%':Airports}
  let langObj = {"en":"english","es":"spanish"}
  let matches = slugObj;
  if(Object.keys(matches).length>0){
    var arrayToInsert = [];

    for await (let key of Object.keys(matches)) {
      let collection_name = catobj[matches[key][0]]
      //console.log(collection_name)
      let eng_name = ""
          
      let data = await collection_name.find().limit(4)

      //console.log(key+'----', data,matches[key][0]); 


      for await (const myvar of data) {

        /* if(matches[key][0]=='%airline%') {
          eng_name = myvar.airline_name
        } else eng_name = myvar.english */

        if(matches[key][0]=='%airline%') {
          eng_name = myvar.airline_name
        } else eng_name = myvar[langObj[key]]

        if(pageslugs.languages && pageslugs.languages.length>0 && Object.keys(pageslugs.languages[0]).length>0 && pageslugs.languages[0][key]){
          req.body.page_type = pageslugs.languages[0][key]
        }
  
        const originalString = req.body.page_type;
        const searchVariable = matches[key][0];
        const replacementValue = eng_name;
        //console.log(slugs[key]);
        const modifiedString = originalString.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue);
        //console.log('modifiedString---',modifiedString);
        //console.log('[key]',req.body.data[key])
        let ndata = convertToData(req.body.data[key],searchVariable,replacementValue)

        //console.log('ndata',ndata,matches[key].length)
        //return;
        if(matches[key].length>1){
          let modifiedSlug;
          if(slugs[key]){
            const oslug = modifiedString
            modifiedSlug = oslug.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue);
            //console.log(modifiedSlug)
          }
          let url2 = (modifiedSlug!=""?modifiedSlug:modifiedString)
          //console.log('m------',key,catobj,matches[key][1],modifiedString,req.body,key,url2,ndata,matches[key].length)
          let arr2 = await forloop(catobj[matches[key][1]],matches[key][1],modifiedString,req.body,key,url2,ndata,matches[key].length)
          //console.log('arr3arr3',matches[key].length, arr2); //return;

          if(matches[key].length==3 && arr2.length>0){
  
            for await (const arr2val of arr2) {

              /*let modifiedSlug2;
              if(arr2val.slug){
                const oslug2 = arr2val.slug
                modifiedSlug2 = oslug2.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue);
                console.log(modifiedSlug2)
              }

              let ndata = convertToData(arr2val.data,searchVariable,replacementValue)

              let url3 = (modifiedSlug2?modifiedSlug2:arr2val.slug) */

              let arr3=await forloop(catobj[matches[key][2]],matches[key][2],arr2val.title,req.body,key,arr2val.slug,arr2val.data)


              //console.log('parmas',catobj[matches[key][2]],matches[key][2],arr2val.title,req.body,key,arr2val.slug,arr2val.data);
              //console.log('arr3arr3444',arr3); return;


              arrayToInsert = arrayToInsert.concat(arr3)
  
            }
  
          }else {
            arrayToInsert = arrayToInsert.concat(arr2)
          }
        }else{
            let url = (slugs[key]?convertToSlug(slugs[key].replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue))+'.html':convertToSlug(modifiedString)+'.html')
            var exists = await Webpages.find({'slug':url}).then(function (result){
                  //console.log('result',result)
                  return result;         
              });   

            if(exists.length==0){
              var singleRow = {
                  category: req.body.category,
                  page_type: req.body.page_type_id,
                  title: modifiedString,
                  data: ndata,
                  slug: url,
                  lang: key,
              };
              arrayToInsert.push(singleRow);  
            }
        }
  
      }    


    
    }

    
    //console.log("arrayToInsert-----",arrayToInsert.length)


    //return;

    /* for(let key of Object.keys(body_arr)) {

      for (let i = 0; i < body_arr[key].length; i++) {


        let collection_name = catobj[body_arr[key][i]]
        console.log(collection_name)
        let eng_name = ""
            
        let data = await collection_name.find().limit(4)

        console.log('----', data,body_arr[key][i]); 


        for await (const myvar of data) {

          if(body_arr[key][i]=='%airline%') {
            eng_name = myvar.airline_name
          } else eng_name = myvar[langObj[key]]
          const searchVariable = body_arr[key][i];
          const replacementValue = eng_name;

          



          for (let i = 0; i < arrayToInsert.length; i++) {

            console.log('arrayToInsert.data',arrayToInsert[i].data)

            arrayToInsert[i]['data'] = convertToData(arrayToInsert[i].data,searchVariable,replacementValue)
            //console.log('arrayToInsert',arrayToInsert[i].data)

          }

        }
      }

    }
    console.log("arrayToInsert2-----",arrayToInsert) */

    //return;

        

  }

  var chunkedArray = splitArray(arrayToInsert, 10);
  console.log(chunkedArray)

  for await (const insertRecords of chunkedArray) {

    await Webpages.insertMany(insertRecords)

  }
  res.status(200).json({'success': 'new documents added!', 'data': arrayToInsert});
    
  //}
  //console.log(matches);

}
// Create and Save a new Webpages
exports.create2 = async (req, res) => {
  // Validate request
  if (!req.body.page_type || !req.body.category) {
    res.status(400).send({ message: "category and page_type can not be empty!" });
    return;
  }

  let category_name = req.body.category

  if(req.body.category=='cities'){
    var arrayToInsert = [];      
    await Cities.find().limit(4)
      .then( async data => {

      for await (const city1 of data) {
        let city1_name = city1.english

        if(req.body.page_type=='cities'){
          for await (const city2 of data) {
            let url = convertToSlug(city1_name+'-to-'+city2.english)+'.html'
            if(city1_name!=city2.english){
              var exists = await Webpages.find({'slug':url}).then(function (result){
                    //console.log('result',result)
                    return result;         
                });   
              if(exists.length==0){
                var singleRow = {
                  category: category_name,
                  page_type: req.body.page_type,
                  title: req.body.title,
                  description: req.body.description,
                  meta_title: req.body.title,
                  meta_keywords: req.body.meta_keywords,
                  meta_description: req.body.meta_description,
                  slug: url,
                };
                //console.log(singleRow)
                arrayToInsert.push(singleRow);
              }
            }            
          };
          console.log('arrayToInsert',arrayToInsert)
        } else if(req.body.page_type=='cheap_flight'){

            let url = convertToSlug('cheap-flight-to-'+city1_name)+'.html'
            const exists = await Webpages.find({'slug':url}).then(result => { return result;  })

            if(exists.length==0){
              var singleRow = {
                  category: category_name,
                  page_type: req.body.page_type,
                  title: req.body.title,
                  description: req.body.description,
                  meta_title: req.body.title,
                  meta_keywords: req.body.meta_keywords,
                  meta_description: req.body.meta_description,
                  slug: url,
              };
              arrayToInsert.push(singleRow);
            }

        }else if(req.body.page_type=='countries'){

          let countries = await Countries.find().limit(4)
            .then(countries => { return countries })

            //console.log(countries)

            for await (const country of countries) {
              let url = convertToSlug(city1_name+'-to-'+country.english)+'.html'
                  let exists = await Webpages.find({'slug':url})
                  .then(exists => { return exists; })
                    console.log(exists)
                    if(exists.length==0){
                      var singleRow = {
                        category: category_name,
                        page_type: req.body.page_type,
                        title: req.body.title,
                        description: req.body.description,
                        meta_title: req.body.title,
                        meta_keywords: req.body.meta_keywords,
                        meta_description: req.body.meta_description,
                        slug: url,
                      };
                      arrayToInsert.push(singleRow);
                    }               
              };
              console.log(arrayToInsert)        

      }     


  };     

      console.log(arrayToInsert)
      Webpages.insertMany(arrayToInsert)  
      .then((result) => {
          console.log("result ", result);
          res.status(200).json({'success': 'new documents added!', 'data': result});
      })
      .catch(err => {
          console.error("error ", err);
          res.status(400).json({err});
      });

      //res.send(arrayToInsert);

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving webpagess."
      });
    });

  }
  
  
  else if(req.body.category=='countries'){
  var arrayToInsert = [];      
  Countries.find().limit(4)
        .then(async data => {         

          for await (const country1 of data) {
            let country1_name = country1.english
    
            if(req.body.page_type=='countries'){
              for await (const country2 of data) {          
                if(country2.english!=country1_name){
                    console.log('yesss')
                    let url = convertToSlug(country1_name+'-'+country2.english)+'.html'

                  let exists = await Webpages.find({'slug':url}).then(exists => { return exists; })
                    console.log(exists)
                    console.log('lennn',exists.length)
                  if(exists.length==0){
                      var singleRow = {
                        category: category_name,
                        page_type: req.body.page_type,
                        title: req.body.title,
                        description: req.body.description,
                        meta_title: req.body.title,
                        meta_keywords: req.body.meta_keywords,
                        meta_description: req.body.meta_description,
                        slug: url,
                      };
                      arrayToInsert.push(singleRow);
                    }
                }                
              };
            }else if(req.body.page_type=='cheap_flight'){

                let url = convertToSlug('cheap-flight-to-'+country1_name)+'.html'
                console.log(url)
                let exists = await Webpages.find({'slug':url}).then(exists => { return exists });
                  if(exists.length==0){
                    var singleRow = {
                      category: category_name,
                      page_type: req.body.page_type,
                      title: req.body.title,
                      description: req.body.description,
                      meta_title: req.body.title,
                      meta_keywords: req.body.meta_keywords,
                      meta_description: req.body.meta_description,
                      slug: url,
                    };
                    arrayToInsert.push(singleRow);
                  }
            }else if(req.body.page_type=='cities'){

              let cities = await Cities.find().limit(4)
                .then(cities => { return cities })
    
                //console.log(cities)
    
                for await (const city of cities) {
                  let url = convertToSlug(country1_name+'-to-'+city.english)+'.html'
                      let exists = await Webpages.find({'slug':url})
                      .then(exists => { return exists; })
                        console.log(exists)
                        if(exists.length==0){
                          var singleRow = {
                            category: category_name,
                            page_type: req.body.page_type,
                            title: req.body.title,
                            description: req.body.description,
                            meta_title: req.body.title,
                            meta_keywords: req.body.meta_keywords,
                            meta_description: req.body.meta_description,
                            slug: url,
                          };
                          arrayToInsert.push(singleRow);
                        }               
                  };
                  console.log(arrayToInsert)        
    
            } 
          };

          console.log(arrayToInsert)
          Webpages.insertMany(arrayToInsert)  
          .then((result) => {
              console.log("result ", result);
              res.status(200).json({'success': 'new documents added!', 'data': result});
          })
          .catch(err => {
              console.error("error ", err);
              res.status(400).json({err});
          });

        

          //res.send(arrayToInsert);

        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving webpagess."
          });
        });

      }
};

// Retrieve all Page_typess by filters from the database.
exports.filter = (req, res) => {
  //const category = req.body.category;
  var condition = {}
  if(req.body.category) condition['category'] = req.body.category;
  if(req.body.page_type) condition['page_type'] = req.body.page_type;
  console.log(condition)
  if(Object.keys(condition).length>0){

    Webpages.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving page_typess."
      });
    });

  }else{
    res.send({'msg':'filter params empty','status':false});

  }
  
};

// Retrieve all Webpagess from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Webpages.find(condition).limit(10)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving webpagess."
      });
    });
};

// Find a single Webpages with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Webpages.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Webpages with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Webpages with id=" + id });
    });
};


// Find a single Webpages by slug
exports.single = (req, res) => {
  const slug = req.body.slug;

  Webpages.find({'slug':slug})
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Webpages with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Webpages with id=" + id });
    });
};

// Update a Webpages by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Webpages.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Webpages with id=${id}. Maybe Webpages was not found!`
        });
      } else res.send({ message: "Webpages was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Webpages with id=" + id
      });
    });
};

// Delete a Webpages with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Webpages.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Webpages with id=${id}. Maybe Webpages was not found!`
        });
      } else {
        res.send({
          message: "Webpages was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Webpages with id=" + id
      });
    });
};

// Delete all Webpagess from the database.
exports.deleteAll = (req, res) => {
  Webpages.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Webpagess were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all webpagess."
      });
    });
};

// Find all published Webpagess
exports.findAllPublished = (req, res) => {
  Webpages.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving webpagess."
      });
    });
};
