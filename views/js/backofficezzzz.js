$(document).ready(() => {
  const attributesGeneratorDiv = $('#attributes-generator')
  const customAttribute = $('#custom-attribute-generator')
  const buttonCreateCombination = $('#create-combinations')
  const nextCombination = $('#next-combination')
  const currentTax = $('#current-tax').text()
  // console.log(myJavaScriptVariable )
  attributesGeneratorDiv.append(customAttribute)
  customAttribute.append(buttonCreateCombination)

  toogleAttribute()
  getPriceAttributeGross()
  clickedGenerate(nextCombination, currentTax, combinations)
  buttonCreateCombination.removeClass('btn-outline-primary').addClass('btn-primary')
})

const clickedGenerate = (nextCombination, currentTax, combinations) => {
  $('#create-combinations').click(function () {
    const grossFields = getPriceAttributeGross()
    let combinations = []
    let addPrice

    const checkCreatedCombination = setInterval(() => {
      $('.combination.loaded').each(function (index, element) {
        const dataNumber = $(element).attr('data-index')

        if (dataNumber >= parseInt(nextCombination.text())) {
          clearInterval(checkCreatedCombination)
          const textInFirstTd = $(element).children('td').eq(2).text()
          console.log('datanum', dataNumber)
          const array = textInFirstTd.split(', ')

          let sumaMatchingfieldPriceGross = 0

          array.forEach((name) => {
            const matchingField = grossFields.find((field) => {
              return field.NameAttribute === name
            })

            if (matchingField) {
              sumaMatchingfieldPriceGross += parseFloat(matchingField.priceGross)
            }
          })

          combinations[combinations.length] = {
            id: dataNumber,
            price: sumaMatchingfieldPriceGross,
          }
        }
      })
      combinations.forEach((combination, index, array) => {
        if ($(`input[name^="combination_${combination.id}[attribute_price]"]`).length > 0) {
          const currentTaxRate = currentTax / 100
          const nettoPrice = combination.price / (1 + currentTaxRate)

          $(`input[name^="combination_${combination.id}[attribute_price]"]`).val(nettoPrice.toFixed(6))
          $(`#attribute_${combination.id}`).find('.attribute_priceTE').val(nettoPrice.toFixed(6))
          console.log(array)
          addPrice = true
        }
      })
      console.log(addPrice)
      if (addPrice) {
        clearInterval(checkCreatedCombination)
        const supplier = $('input[name^="form[step6][supplier_combination"][name*="[product_price]"]')
        const combination = $('.combination.loaded')

        const checkInputs = setInterval(() => {
          if (supplier.length === combination.length) {
            const data = $('input, textarea, select')
              .not(':input[type=button], :input[type=submit], :input[type=reset]')
              .serialize()

            $.ajax({
              type: 'POST',
              data,
            })
            console.log('kiedy sa inputy ')

            clearInterval(checkInputs)
            checkNextNumber(nextCombination, combinations)
          }
        }, 100)

        if (supplier.length === 0) {
          const data = $('input, textarea, select')
            .not(':input[type=button], :input[type=submit], :input[type=reset]')
            .serialize()

          $.ajax({
            type: 'POST',
            data,
          })

          console.log('wykonalo sie')
          clearInterval(checkInputs)
          checkNextNumber(nextCombination, combinations)
        }
      }
    }, 100)
  })
}

const checkNextNumber = (nextCombination, combinations) => {
  console.log('chcek num', combinations)
  const numberCombination = parseInt(nextCombination.text())
  nextCombination.text(numberCombination + combinations.length)

  combinations = []
  $('.combination.loaded').each(function (index, element) {
    const dataNumber = $(element).attr('data-index')

    // setInterval(() => {
    // if (dataNumber >= numberCombination) {
    //   const lastNumber = Math.max(dataNumber, numberCombination) + 1
    //   nextCombination.text(lastNumber)
    // }
    // }, 100)
  })
}

const getPriceAttributeGross = () => {
  let grossFields = []
  const grossInputs = $('input[name*="priceGross"]')

  grossInputs.each(function (index, element) {
    const fieldValue = $(element).val()
    const name = $(element).closest('.table').find('.group-name-attribute').text().trim()

    const subname = $(element).closest('tr').children('.group-subname-attribute').text().trim()

    const newData = {
      NameAttribute: `${name} - ${subname}`,
      priceGross: fieldValue,
    }

    grossFields = grossFields.concat(newData)
  })

  return grossFields
}

const formatAttributeName = (attributeName) => {
  attributeName = attributeName
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')

  attributeName = attributeName.replace(/\s+/g, '_')

  attributeName = attributeName.toLowerCase()

  return attributeName
}

const toogleAttribute = () => {
  const attributeList = $('#custom-attribute-list')
  let selectedCombination = []

  if (attributeList.length > 0) {
    attributeList.show()
  }

  if (attributeList.length === 0) {
    attributeList.hide()
  }

  $('.js-attribute-checkbox').change(function (e) {
    e.preventDefault()
    getPriceAttributeGross()
    const subNameAttribute = $(this).parent().children('label').text().trim()
    const nameGroupAttribute = $(this).closest('.attribute-group').children('.attribute-group-name').text().trim()

    const isChecked = $(this).is(':checked')

    if (isChecked) {
      selectedCombination = selectedCombination.concat([
        {
          groupName: nameGroupAttribute,
          subName: subNameAttribute,
        },
      ])
    }

    if (!isChecked) {
      selectedCombination = selectedCombination.filter(
        (item) => !(item.groupName === nameGroupAttribute && item.subName === subNameAttribute)
      )
    }

    const existingGroups = $('#custom-attribute-list .group-name-attribute')

    existingGroups.each(function () {
      const groupName = $(this).text()

      const found = selectedCombination.some(function (item) {
        return item.groupName === groupName
      })

      if (!found) {
        $(this).closest('table').next().remove()
        $(this).closest('table').remove()
      } else {
        const existingSubNames = $(this).closest('thead').next().find('.group-subname-attribute')
        existingSubNames.each(function () {
          const subName = $(this).text()

          const subNameFound = selectedCombination.some(function (item) {
            return item.groupName === groupName && item.subName === subName
          })

          if (!subNameFound) {
            $(this).closest('tr').remove()
          }
        })
      }
    })
    selectedCombination.forEach(function (item) {
      const groupName = item.groupName
      const subName = item.subName

      const existingGroup = $('#custom-attribute-list .group-name-attribute:contains(' + groupName + ')')

      const inputNameGroupName = formatAttributeName(groupName)
      const inputNameSubName = formatAttributeName(subName)

      if (existingGroup.length === 0) {
        const newAttribute = `
        <table class="table" id="attribute-table">
          <thead class="thead-default" id="combinations_thead">
            <tr>
              <th class="group-name-attribute">${groupName}</th>
              <th>Wpływ na cenę produktu (zł)</th>
              <th>Wpływ na wagę produktu (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="group-subname-attribute">${subName}</td>
              <td>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Brutto</span>
                  </div>
                  <input type="number"  value="0.000" required pattern="^\\d+(\\.\\d{1,2})?$" name="priceGross-${inputNameGroupName}-${inputNameSubName}" class="form-control" />
                </div>
              </td>
              <td>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Brutto</span>
                  </div>
                  <input type="number" value="0.000" readonly disabled required name="priceWeight-${inputNameGroupName}-${inputNameSubName}" class="form-control" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>`

        attributeList.append(newAttribute)
      } else {
        const existingSubName = existingGroup
          .closest('thead')
          .next()
          .find('.group-subname-attribute:contains(' + subName + ')')

        if (existingSubName.length === 0) {
          const newSubName = `
          <tr>
            <td class="group-subname-attribute">${subName}</td>
            <td>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">Brutto</span>
                </div>
                <input type="number" id="priceGross" value="0.000" required  name="priceGross-${groupName}-${subName}" class="form-control" />
              </div>
            </td>
            <td>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text">Brutto</span>
                </div>
                <input type="number" id="priceWeight" value="0.000" required readonly disabled name="priceWeight-${groupName}-${subName}" class="form-control" />
              </div>
            </td>
          </tr>`

          existingGroup.closest('thead').next().append(newSubName)
        }
      }
    })
  })
}
