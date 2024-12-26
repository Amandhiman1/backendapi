const db = require("../models");
const Webpages = db.webpages;
const Cities = db.cities;
const Countries = db.countries;
const Airlines = db.airlines;
const Airports = db.airports;
const Page_types = db.page_types;
const itemsPerPage = 10;
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

async function forloop(
  collection_name,
  matches,
  title,
  body,
  lang = "en",
  slug,
  newdata = {},
  eng_slug,
  comm_slug,
  query
) {
  let arrayToInsert = [];
  let langObj = { en: "english", es: "spanish" };
  let data = await collection_name.find().limit(4);

  data = data.filter((entry) => !title.includes(entry[langObj[lang]]));

  //console.log('common_arr-----',common_arr)
  let sr = 0;
  for await (const myvar of data) {
    let query2 = { ...query };

    /* if(matches=='%airline%') {
      eng_name = myvar.airline_name
    } else eng_name = myvar.english */

    if (matches == "%airline%") {
      eng_name = myvar.airline_name;
    } else eng_name = myvar[langObj[lang]];

    const originalString = title;
    const searchVariable = matches;
    const replacementValue = eng_name;
    //console.log(originalString,searchVariable,replacementValue)

    const modifiedString = originalString.replace(
      new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      replacementValue
    );
    //console.log(modifiedString);
    let url =
      convertToSlug(
        slug.replace(
          new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          replacementValue
        )
      ) + ".html";
    var exists = await Webpages.find({ slug: url }).then(async function (
      result
    ) {
      //console.log('result',result)
      return await result;
    });

    if (exists.length == 0) {
      if (matches == "%airline%") {
        eng_name2 = myvar.airline_name;
      } else eng_name2 = myvar["english"];

      // console.log('eng_name2 ==> ', eng_name2);

      const originalString2 = title;
      const originalSlug2 = comm_slug;
      const searchVariable2 = matches;
      const replacementValue2 = eng_name2;
      query2[searchVariable2] = myvar["english"];
      const modifiedString2 = originalString2.replace(
        new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        replacementValue2
      );
      const modifiedSlug2 = originalSlug2.replace(
        new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        replacementValue2
      );
      // console.log('eng_slug ====>',eng_slug);
      let url2 =
        convertToSlug(
          eng_slug.replace(
            new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            replacementValue2
          )
        ) + ".html";
      let final_common_slug = convertToSlug(modifiedSlug2) + ".html";
      let ndata = convertToData(
        newdata,
        searchVariable,
        replacementValue,
        replacementValue2
      );
      //console.log('ndata333',ndata)
      var singleRow = {
        category: body.category,
        page_type: body.page_type_id,
        title: modifiedString2,
        data: ndata,
        lang: lang,
        slug: url2,
        common_slug: final_common_slug,
        common_title: modifiedSlug2,
        query: query2,
      };

      //console.log(originalString,searchVariable,replacementValue)

      //console.log(modifiedString);

      // singleRow['common_slug'] = url2

      // console.log('singleRow', url2, singleRow)
      arrayToInsert.push(singleRow);
    }
    sr++;
  }
  return arrayToInsert;
}

// Function to check if any string in the first array exists as a substring in any of the elements of the second array (array of nodes)
function isAnyStringExistInArrayNode(stringArray, nodeObject) {
  let narr = [];
  for (const property in nodeObject) {
    if (typeof nodeObject[property] === "string") {
      for (const searchString of stringArray) {
        if (nodeObject[property].includes(searchString)) {
          narr.push(searchString); // Found a string that exists as a substring in the array of nodes
        }
      }
    }
  }

  if (narr.length > 0) {
    return narr.filter(function (item, pos) {
      return narr.indexOf(item) == pos;
    });
  } else return false;
}

function convertToData(
  nodeObject,
  searchVariable,
  replacementValue,
  replacementValue2
) {
  let nobj = {};

  for (const property in nodeObject) {
    if (typeof nodeObject[property] === "string") {
      let oldval = nodeObject[property];

      const regex = /{{#(.*?)#}}/g;
      const matches = nodeObject[property].match(regex);

      matches &&
        matches.forEach((match) => {
          let nvar = match.replace(
            new RegExp(
              searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              "g"
            ),
            replacementValue2
          );
          oldval = oldval.replace(
            new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            nvar
          );
        });

      nobj[property] = oldval.replace(
        new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        replacementValue
      );
    } else if (typeof nodeObject[property] === "object") {
      console.log("Reached in object");
      nobj[property] = convertToData(
        nodeObject[property],
        searchVariable,
        replacementValue,
        replacementValue2
      );
    }
  }

  return nobj;
}

// function convertToData(nodeObject, searchVariable, replacementValue, replacementValue2) {

//   // console.log('convertToData',nodeObject,searchVariable,replacementValue,replacementValue2)
//   let nobj = {}
//   for (const property in nodeObject) {
//     if (typeof nodeObject[property] === 'string') {

//       let oldval = nodeObject[property]

//       const regex = /{{#(.*?)#}}/g;
//       // Find all matches using the regular expression
//       const matches = nodeObject[property].match(regex);
//       matches && matches.forEach((match, i) => {

//         let nvar = match.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue2);
//         //console.log('nvar',nvar,match)

//         oldval = nodeObject[property].replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), nvar)
//       })
//       //console.log('oldval',oldval)
//       nobj[property] = oldval.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue)
//     } else if (typeof nodeObject[property] === 'object') {
//       console.log('reached in object');
//       // nobj[property] = nodeObject[property];
//       for (const item in nodeObject[property]) {
//         if (typeof nodeObject[property][item] === 'string') {
//           let oldval = nodeObject[property][item]

//           const regex = /{{#(.*?)#}}/g;
//           // Find all matches using the regular expression
//           const matches = nodeObject[property][item].match(regex);
//           matches && matches.forEach((match, i) => {

//             let nvar = match.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue2);
//             //console.log('nvar',nvar,match)

//             oldval = nodeObject[property][item].replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), nvar)
//           })
//           //console.log('oldval',oldval)
//           nobj[property][item] = oldval.replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue)
//         }
//       }
//     }
//   }

//   return nobj;
// }

exports.create = async (req, res) => {
  if (!req.body.page_type || !req.body.category) {
    res
      .status(400)
      .send({ message: "category and page_type can not be empty!" });
    return;
  }
  let categories = [
    "%city%",
    "%city2%",
    "%country%",
    "%country2%",
    "%airline%",
    "%airline2%",
    "%airport%",
    "%airport2%",
  ];

  // console.log(req.body.data);

  let pageslugs = await Page_types.findOne({ _id: req.body.page_type_id });

  // console.log('pageslugs ==> ' + pageslugs);

  //console.log(pageslugs.languages, typeof pageslugs.languages[0],Object.keys(pageslugs.languages[0]).length,Object.keys(req.body.data).length);

  let slugs = {};

  // console.log('pageslugs ==> '+pageslugs);

  if (
    pageslugs.languages &&
    req.body.data &&
    pageslugs.languages.length > 0 &&
    Object.keys(pageslugs.languages[0]).length > 0 &&
    Object.keys(req.body.data).length > 0
  ) {
    for await (let key of Object.keys(req.body.data)) {
      // console.log(req.body.data[key], pageslugs.languages[key])

      if (req.body.data[key].slug) {
        slugs[key] = req.body.data[key].slug;
      } else if (pageslugs.languages[0][key]) {
        slugs[key] = pageslugs.languages[0][key];
      } else {
        slugs[key] = req.body.page_type;
      }
    }
  } else if (req.body.data && Object.keys(req.body.data).length > 0) {
    for await (let key of Object.keys(req.body.data)) {
      if (req.body.data[key].slug) {
        // console.log('the if block');
        slugs[key] = req.body.data[key].slug;
      } else {
        // console.log('the else block');
        slugs[key] = pageslugs.languages[key];
      }
    }
  } else {
    slugs["en"] = req.body.page_type;
  }

  const slugObj = {};
  for await (let key of Object.keys(slugs)) {
    let narr = [];
    if (typeof slugs[key] === "string") {
      for await (const searchString of categories) {
        if (slugs[key].includes(searchString)) {
          narr.push(searchString); // Found a string that exists as a substring in the array of nodes
        }
      }
    }

    slugObj[key] = narr;
  }

  let body_arr = {};
  for await (let key of Object.keys(req.body.data)) {
    //console.log(key,req.body.data[key]);
    const result = isAnyStringExistInArrayNode(categories, req.body.data[key]);
    // console.log(result);
    let arra;
    if (slugObj[key].length > 0 && result.length > 0) {
      //slugObj.filter(x => slugObj[key].includes(x));
      //arra = result.filter(x => !slugObj[key].includes(x)).concat(slugObj[key].filter(x => !result.includes(x)));

      // console.log('reached in arra if');
      arra = result.filter((x) => !slugObj[key].includes(x));
      //console.log('result',arra, slugObj[key]);
    }

    body_arr[key] = arra;
  }
  // console.log('slugObj', slugObj, body_arr);

  let catobj = {
    "%city%": Cities,
    "%city2%": Cities,
    "%country%": Countries,
    "%country2%": Countries,
    "%airline%": Airlines,
    "%airline2%": Airlines,
    "%airport%": Airports,
    "%airport2%": Airports,
  };
  let langObj = { en: "english", es: "spanish" };
  let matches = slugObj;
  // console.log('matches', matches)
  if (Object.keys(matches).length > 0) {
    var arrayToInsert = [];
    for await (let key of Object.keys(matches)) {
      let collection_name = catobj[matches[key][0]];
      console.log('collection_name', collection_name);
      let eng_name = "";
      let eng_slug = "";

      if (collection_name) {
        let data = await collection_name.find().limit(4);

        // console.log(key+'----', data,matches[key][0]);

        for await (const myvar of data) {
          /* if(matches[key][0]=='%airline%') {
            eng_name = myvar.airline_name
          } else eng_name = myvar.english */

          let query = {};

          if (matches[key][0] == "%airline%") {
            eng_name = myvar.airline_name;
          } else {
            eng_name = myvar[langObj[key]];
            eng_slug = myvar[langObj["en"]];
          }

          // console.log('eng_name ==> '+eng_name);

          // if (pageslugs.languages && pageslugs.languages.length > 0 && Object.keys(pageslugs.languages[0]).length > 0 && pageslugs.languages[0][key]) {
          //   req.body.page_type = pageslugs.languages[0][key]
          // }

          let common_page_type = pageslugs.languages[key];
          // console.log('common_page_type ==> ', common_page_type);
          // let common_page_type = req.body.page_type
          // if (pageslugs.languages && pageslugs.languages.length > 0 && Object.keys(pageslugs.languages[0]).length > 0 && pageslugs.languages[0]['en']) {
          //   common_page_type = pageslugs.languages[0]['en']
          // }

          // console.log(common_page_type, common_page_type)

          const originalString = common_page_type;
          const searchVariable = matches[key][0];
          const replacementValue = eng_name;
          const originalCommonSlug = pageslugs.title;
          //console.log(slugs[key]);
          const modifiedString = originalString.replace(
            new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            replacementValue
          );
          const modifiedCommonSlug = originalCommonSlug.replace(
            new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            eng_slug
          );
          // console.log('modifiedString---',modifiedString);
          //console.log('[key]',req.body.data[key])

          let data2 = await collection_name.find().limit(4);
          // console.log(data2);
          // console.log(langObj);
          data2 = data2.filter(
            (item) => item[langObj[key]] !== replacementValue
          );
          // console.log('data2 ==> ' + data2);

          // for await (const myvar2 of data2) {
          if (matches[key][0] == "%airline%") {
            eng_name = myvar.airline_name;
          } else {
            eng_name = myvar[langObj[key]];
            eng_slug = myvar[langObj["en"]];
          }

          const originalString2 = modifiedString;
          const originalCommonSlug2 = modifiedCommonSlug;
          const searchVariable2 = matches[key][0];
          const replacementValue2 = eng_name;
          const replacementSlug2 = eng_slug;
          //console.log(slugs[key]);
          query[searchVariable2] = myvar["english"];
          const modifiedString2 = originalString2.replace(
            new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            replacementValue2
          );
          const modifiedCommonSlug2 = originalCommonSlug2.replace(
            new RegExp(searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
            replacementSlug2
          );
          // console.log('modifiedString2 ==> ' + modifiedString2);

          let ndata = convertToData(
            req.body.data[key],
            searchVariable,
            replacementValue,
            replacementValue2
          );

          //console.log('ndata',ndata,matches[key].length)
          //return;
          if (matches[key].length > 1) {
            let modifiedSlug;
            if (slugs[key]) {
              const oslug = modifiedString;
              modifiedSlug = oslug.replace(
                new RegExp(
                  searchVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                ),
                replacementValue
              );
              //console.log(modifiedSlug)
            }
            let url2 = modifiedSlug != "" ? modifiedSlug : modifiedString;

            let modifiedSlug2;
            if (slugs[key]) {
              const oslug2 = modifiedString2;
              modifiedSlug2 = oslug2.replace(
                new RegExp(
                  searchVariable2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                ),
                replacementValue2
              );
              //console.log(modifiedSlug)
            }
            let common_slug =
              modifiedSlug2 != "" ? modifiedSlug2 : modifiedString2;
            // console.log("common_slug",common_slug)

            let arr2 = await forloop(
              catobj[matches[key][1]],
              matches[key][1],
              modifiedString2,
              req.body,
              key,
              url2,
              ndata,
              common_slug,
              modifiedCommonSlug2,
              query
            );
            //console.log('arr3arr3',matches[key].length, arr2); //return;

            // console.log('the if block');

            if (matches[key].length == 3 && arr2.length > 0) {
              for await (const arr2val of arr2) {
                let arr3 = await forloop(
                  catobj[matches[key][2]],
                  matches[key][2],
                  arr2val.title,
                  req.body,
                  key,
                  arr2val.slug,
                  arr2val.data,
                  arr2val.title,
                  arr2val.common_title,
                  query
                );

                arrayToInsert = arrayToInsert.concat(arr3);
                // console.log(arr3);
              }
            } else {
              // console.log(arr2);
              arrayToInsert = arrayToInsert.concat(arr2);
            }
          } else {
            // console.log("the else block");
            // let url = (slugs[key] ? convertToSlug(slugs[key].replace(new RegExp(searchVariable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), replacementValue)) + '.html' : convertToSlug(modifiedString2) + '.html')
            let url = convertToSlug(modifiedString2) + ".html";
            let final_common_slug =
              convertToSlug(modifiedCommonSlug2) + ".html";
            var exists = await Webpages.find({ slug: url }).then(function (
              result
            ) {
              //console.log('result',result)
              return result;
            });

            if (exists.length == 0) {
              var singleRow = {
                category: req.body.category,
                page_type: req.body.page_type_id,
                title: modifiedString2,
                data: ndata,
                slug: url,
                lang: key,
                common_slug: final_common_slug,
                query: query,
              };
              arrayToInsert.push(singleRow);
            }
          }
          // }
        }
      }
    }

    //console.log("arrayToInsert-----",arrayToInsert,arrayToInsert.length)

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

  const filteredArray = removeDuplicates(arrayToInsert, "title");
  var chunkedArray = splitArray(filteredArray, 10);
  console.log(chunkedArray);

  for await (const insertRecords of chunkedArray) {
    await Webpages.insertMany(insertRecords);
  }
  res
    .status(200)
    .json({ success: "new documents added!", data: filteredArray });

  //}
  //console.log(matches);
};

// Function to remove duplicates based on the "title" key
const removeDuplicates = (array, key) => {
  const uniqueKeys = new Set();
  return array.filter((obj) => {
    const keyValue = obj[key];
    if (!uniqueKeys.has(keyValue)) {
      uniqueKeys.add(keyValue);
      return true;
    }
    return false;
  });
};

// Create and Save a new Webpages
/* exports.create2 = async (req, res) => {
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
}; */

// Retrieve all Page_typess by filters from the database.
exports.filter = async (req, res) => {
  //const category = req.body.category;
  var condition = {};
  if (req.body.category) condition["category"] = req.body.category;
  if (req.body.page_type) condition["page_type"] = req.body.page_type;
  if (req.body.lang) condition["lang"] = req.body.lang;
  console.log(condition);
  if (Object.keys(condition).length > 0) {
    const { page } = req.query;
    if (page) {
      const pageNumber = parseInt(page, 10) || 1;

      const totalCount = await Webpages.find(condition).countDocuments();

      Webpages.find(condition)
        .skip((pageNumber - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .then((data) => {
          res.send({
            data: data,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / itemsPerPage),
          });
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving airportss.",
          });
        });
    } else {
      await Webpages.find(condition)
        .limit(100)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving citiess.",
          });
        });
    }
  } else {
    res.send({ msg: "filter params empty", status: false });
  }
};

// Retrieve all Webpagess from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  var condition = title
    ? { title: { $regex: new RegExp(title), $options: "i" } }
    : {};

  const { page } = req.query;
  if (page) {
    const pageNumber = parseInt(page, 10) || 1;

    const totalCount = await Webpages.countDocuments();

    Webpages.find(condition)
      .skip((pageNumber - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .then((data) => {
        res.send({
          data: data,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / itemsPerPage),
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving airportss.",
        });
      });
  } else {
    await Webpages.find(condition)
      .limit(itemsPerPage)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving citiess.",
        });
      });
  }
};

// Find a single Webpages with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Webpages.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Webpages with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Webpages with id=" + id });
    });
};

// Find a single Webpages by slug
exports.single = (req, res) => {
  const slug = req.body.slug;

  Webpages.find({ slug: slug })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: "Not found Webpages with slug " + slug });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Webpages with slug=" + slug });
    });
};

// Find a single Webpages by common_slug
exports.singleBySlug = (req, res) => {
  console.log(req.body);
  const slug = req.body.common_slug;
  const lang = req.body.lang;

  Webpages.find({ common_slug: req.body.common_slug, lang: lang })
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Webpages with id " + id });
      else res.send(data[0].slug);
    })
    .catch((err) => {
      console.log("ERROR in finding page by common_slug and language", err);
      res.status(500).send({ err });
    });
};

// Find a single Webpages by slug
exports.bylang = (req, res) => {
  const slug = req.body.slug;
  var condition = {};
  if (req.body.slug) condition["slug"] = req.body.slug;
  if (req.body.lang) condition["lang"] = req.body.lang;

  const query = {
    $or: [
      { common_slug: req.body.slug },
      { slug: req.body.slug },

      // Add more conditions as needed
    ],
  };

  const selectedFields = {
    common_slug: 1, // Include field1
    lang: 1, // Include field2
    _id: 0, // Exclude the _id field
  };

  Webpages.find(query, selectedFields)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Webpages with id " + id });
      else {
        if (data.length > 0) {
          console.log("datadata", data);
          const query2 = {
            common_slug: data[0].common_slug,
            lang: req.body.lang,
          };

          const selectedFields2 = {
            slug: 1, // Include field1
            lang: 1, // Include field2
            _id: 0, // Exclude the _id field
          };
          Webpages.find(query2, selectedFields2)
            .then((data2) => {
              if (data2.length > 0) res.send(data2);
              else res.send([]);
            })
            .catch((err) => {
              res
                .status(500)
                .send({ message: "Error retrieving Webpages with id=" + id });
            });
        } else res.send([]);
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Webpages with id=" + id });
    });
};

// Update a Webpages by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Webpages.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Webpages with id=${id}. Maybe Webpages was not found!`,
        });
      } else res.send({ message: "Webpages was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Webpages with id=" + id,
      });
    });
};

// Delete a Webpages with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Webpages.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Webpages with id=${id}. Maybe Webpages was not found!`,
        });
      } else {
        res.send({
          message: "Webpages was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Webpages with id=" + id,
      });
    });
};

// Delete all Webpagess from the database.
exports.deleteAll = (req, res) => {
  Webpages.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Webpagess were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all webpagess.",
      });
    });
};

// Find all published Webpagess
exports.findAllPublished = (req, res) => {
  Webpages.find({ published: true })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving webpagess.",
      });
    });
};
