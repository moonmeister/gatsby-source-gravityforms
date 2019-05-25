const { isArray, isObject } = require('./helpers')

/**
 * Take raw Gravity Forms data and turn into usable
 * Gatsby consumable objects.
 * @param  function     createContentDigest Gatsby helper function
 * @param  object       formObj             Raw Gravity Forms form info
 * @param  array        ignoreFields        Array of top level fields to ignore
 * @return object                           Processed form data
 */

const processForms = (createContentDigest, formObj, ignoreFields) => {
    // Add the Gatsby internal information.
    // contentDigest tracks any changes and lets Gatsby know if
    // the data needs to be rerendered, or is everything is
    // the same.

    let newFormObj = {
        id: `gravity-form-${formObj.id}`,
        internal: {
            contentDigest: createContentDigest(formObj),
            type: 'GF__Form',
        },
    }

    // Delete the original raw object id, as in the loop below
    // all keys are pulled into the new object. No need to
    // process it.

    delete formObj.id

    // Ignore fields sets fields to skip. This could be due to
    // sensitive info or not needed on the frontend
    // We need to ensure the ignore fields are only an array.
    // If it is anything else, it will break the loop. If it
    // is not an array, empty!

    // TODO: Use an object instead of an array. But array was
    // easier for now.

    ignoreFields = isArray(ignoreFields) ? ignoreFields : null

    // Loop through the form fields. Check we want to show all
    // fields, ensure fields are formatted correctly,
    // updated fields that are called protected names (e.g. fields)

    for (const [key, value] of Object.entries(formObj)) {
        if (!ignoreFields.includes(key)) {
            // If the value is an object, add it right away.
            // No changes are needed (yet).
            //
            // TODO: Check if there are arrays within the object

            if (!isArray(formObj[key])) {
                newFormObj[key] = formObj[key]
            } else {
                let newContent = {}
                let arrayCount = 0

                formObj[key].forEach(arr => {
                    // Today arrays do not start at 0
                    // Because we are turning these into objects
                    arrayCount = arrayCount + 1
                    newContent[arrayCount] = arr
                })

                // Gatsby has saved 'fields' for its own use
                // so we cannot use this key.
                if (key == 'fields') {
                    newFormObj['formFields'] = newContent

                    // @TODO
                    // Need to create processor that fixes
                    // type issues
                    // and opens up choices into objects
                } else {
                    newFormObj[key] = newContent
                }
            }
        }
    }

    return newFormObj
}

module.exports = {
    processForms,
}