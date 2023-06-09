
import moment from "moment"
import { TRACKER_ENTITY_INSTANCES_ROUTE } from "../api.routes"
import { ATTRIBUTE, COLOR, CURRENT, DATA_ELEMENT, DATE, ENROLLMENT, ENROLLMENT_DATE, IMAGE, INCIDENT_DATE, LABEL, ORGANISATION_UNIT_NAME, OTHER_ELEMENT, SELECTED_DATE, TRACKER } from "./constants"



const drawCamember = (legendTypeId, legends, attribute_code, value, current_html_element) => {

  const current_legend = legends.find(leg => leg.id === legendTypeId)

  if (current_legend && current_html_element) {

    let canvas = document.createElement('canvas')

    let canvas_parent = document.createElement('div')
    canvas_parent.setAttribute('style', "width:50px; height:50px;margin:0px auto;")


    canvas_parent.innerHTML = ""
    canvas_parent.append(canvas)


    current_html_element.innerHTML = ""
    current_html_element.append(canvas_parent)


    if (canvas) {
      const myChart = new Chart(canvas, {
        type: 'pie',
        data: {
          datasets: [{
            data: [parseInt(value), (100 - parseInt(value))],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: "#000",
            borderWidth: 1
          }]
        }
      })
    }



  } else {
    injectDataIntoHtml(attribute_code, "<span style='background:red;color: #fff display: flex; justify-content: center; align-items: center;'>No Legend choose</span>")
  }

}



const injectFromId = (id, value) => {
  const element = document.querySelectorAll('[id="' + id + '"]')
  if (element && element.length > 0) {
    element.forEach(current_el => {
      current_el.innerHTML = value
    })
  }
}




const defaultValueToApply = (attribute, item) => {

  if (item.defaultType === COLOR) {
    injectFromId(attribute, '<span style="color: ' + item.notApplicable + '; height:100%; width: 100%;"></span>')
  }

  if (item.defaultType === IMAGE) {
    injectFromId(attribute, "<img src='" + item.notApplicable + "' style='width: 40px; height:40px;' />")
  }

  if (item.defaultType === LABEL) {
    injectFromId(attribute, "<span>" + item.notApplicable + "</span>")
  }

}

const defaultMissingValueToApply = (attribute, item) => {

  if (item.defaultType === COLOR) {
    injectFromId(attribute, '<span style="color: ' + item.missingData + '; height:100%; width: 100%;"></span>')
  }

  if (item.defaultType === IMAGE) {
    injectFromId(attribute, "<img src='" + item.missingData + "' style='width: 40px; height:40px;' />")
  }

  if (item.defaultType === LABEL) {
    injectFromId(attribute, "<span>" + item.missingData + "</span>")
  }

}


const checkColorLegend = (legendTypeId, legends, attribute_code, value) => {

  const current_legend = legends.find(leg => leg.id === legendTypeId)

  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {
      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(item.end).toFixed(4))) {
        const element = document.querySelector('[id="' + attribute_code + '"]')
        if (element) {
          element.innerHTML = '<span style="font-weight: bold;">' + value + '</span>'
          element.style.background = item.color
          element.style.color = '#ffffff'
          element.style.textAlign = 'center'
        }
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) === parseFloat(parseFloat(item.end).toFixed(4))) {
        const element = document.querySelector('[id="' + attribute_code + '"]')
        if (element) {
          element.innerHTML = '<span style="font-weight: bold;">' + value + '</span>'
          element.style.background = item.color
          element.style.color = '#ffffff'
          element.style.textAlign = 'center'
        }
      }


    }

    const min = parseFloat(Math.min.apply(null, current_legend.items.map(i => i.start)))
    const max = parseFloat(Math.max.apply(null, current_legend.items.map(i => i.end)))

    // if (parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(min).toFixed(4)) || parseFloat(parseFloat(value).toFixed(4)) > parseFloat(parseFloat(max).toFixed(4))) {
    //   defaultValueToApply(attribute_code, current_legend)
    // }

    // if (!value) {
    //   defaultMissingValueToApply(attribute_code, current_legend)
    // }

  } else {
    injectDataIntoHtml(attribute_code, "<span style='background:red;color: #fff display: flex; justify-content: center; align-items: center;'>No Legend name</span>")
  }
}


const checkLabelLegend = (legendTypeId, legends, attribute_code, value) => {
  const current_legend = legends.find(leg => leg.id === legendTypeId)
  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {
      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, '<span>' + item.name + '</span>')
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) === parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, '<span>' + item.name + '</span>')
      }
    }

    const min = parseFloat(Math.min.apply(null, current_legend.items.map(i => i.start)))
    const max = parseFloat(Math.max.apply(null, current_legend.items.map(i => i.end)))

    // if (parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(min).toFixed(4)) || parseFloat(parseFloat(value).toFixed(4)) > parseFloat(parseFloat(max).toFixed(4))) {
    //   defaultValueToApply(attribute_code, current_legend)
    // }


    // if (!value) {
    //   defaultMissingValueToApply(attribute_code, current_legend)
    // }

  } else {
    injectDataIntoHtml(attribute_code, "<span style='background:red;color: #fff display: flex; justify-content: center; align-items: center;'>No Legend name</span>")
  }
}


const checkImageLegend = (legendTypeId, legends, attribute_code, value) => {
  const current_legend = legends.find(leg => leg.id === legendTypeId)
  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {
      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, "<img src='" + item.image + "' style='width: 40px; height:40px;' />")
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) === parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, "<img src='" + item.image + "' style='width: 40px; height:40px;' />")
      }

    }

    const min = parseFloat(Math.min.apply(null, current_legend.items.map(i => i.start)))
    const max = parseFloat(Math.max.apply(null, current_legend.items.map(i => i.end)))


    // if (parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(min).toFixed(4)) || parseFloat(parseFloat(value).toFixed(4)) > parseFloat(parseFloat(max).toFixed(4))) {
    //   defaultValueToApply(attribute_code, current_legend)
    // }

    // if (!value) {
    //   defaultMissingValueToApply(attribute_code, current_legend)
    // }

  } else {
    injectDataIntoHtml(attribute_code, "<span style='background:red;color: #fff display: flex; justify-content: center; align-items: center;'>No Legend name</span>")
  }
}


const inject_legend = (legendType, legendId, legends, attribute_code, value) => {
  if (legendType && legendId && legends && attribute_code && value) {
    switch (legendType) {
      case "color":
        checkColorLegend(legendId, legends, attribute_code, value)
        break

      case "label":
        checkLabelLegend(legendId, legends, attribute_code, value)
        break

      case "image":
        checkImageLegend(legendId, legends, attribute_code, value)
        break

      case "pie":
        drawCamember(legendId, legends, attribute_code, value, html_id_code)
        break

      default:
        break
    }
  }
}


export const inject_tei_into_html = (report, current_tei, selectedProgramTrackerFromHTML) => {

  if (!selectedProgramTrackerFromHTML)
    return console.log("pas de program selectionner")


  if (!current_tei)
    return console.log("pas de tei selectionner")

  let my_container = document.querySelector('[id="my-table-container"]')
  const report_html_cloned = report.html


  let parser = new DOMParser()
  const report_html_cloned_document = parser.parseFromString(report_html_cloned, 'text/html')


  let program_tracker_list = report_html_cloned_document.querySelectorAll('[data-type=' + TRACKER.value + '][id*="' + selectedProgramTrackerFromHTML.id + '"]')

  /*  Néttoyage du contenu */
  for (let program_tracker of program_tracker_list) {
    program_tracker.innerHTML = ""
    const get_id = program_tracker.getAttribute("id")
    my_container.querySelector("[id='" + get_id + "']").innerHTML = ""
  }

  // Insertion des données
  for (let program_tracker of program_tracker_list) {

    const get_id = program_tracker.getAttribute("id")
    const get_data_is = program_tracker.getAttribute("data-is")
    const get_data_has_legend = program_tracker.getAttribute("data-has-legend")


    // Interprétation des données sur les attributes
    if (get_data_is === ATTRIBUTE) {
      if (get_id) {
        const get_attribute_id = get_id.split('|')?.[1]
        const attribute_found = current_tei.attributes?.find(at => at.attribute === get_attribute_id)
        const html_el = my_container.querySelector("[id='" + get_id + "']")

        if (attribute_found && html_el) {
          if (!get_data_has_legend || get_data_has_legend === "NO") {
            if (attribute_found.valueType === IMAGE) {
              if (attribute_found.value) {
                html_el.innerHTML = `<img
                style="width: 200px;height:200px;object-fit: cover;"
                src="${TRACKER_ENTITY_INSTANCES_ROUTE
                    .concat('/')
                    .concat(current_tei.trackedEntityInstance)
                    .concat('/')
                    .concat(get_attribute_id)
                    .concat('/image')
                  }"
              />`
              } else {
                html_el.innerHTML = `<img style="width: 200px; height: 200px;object-fit: cover;" src="${STUDENT_IMAGE}" />`
              }
            } else {
              html_el.innerHTML = attribute_found.value
            }
          }
        }

        if (get_data_has_legend === "YES") {
          const get_legend_type = get_id.split("|")?.[3]
          const get_legend_ID = get_id.split("|")?.[2]

          if (get_legend_ID && get_legend_type) {
            inject_legend(get_legend_type, get_legend_ID, report.legends, get_id, attribute_found.value)
          }
        }

      }
    }


    // Interprétation des données sur certaines informations d'enrollment
    if (get_data_is === ENROLLMENT) {
      if (get_id) {
        const get_enrollment_html_id = get_id?.split('|')?.[1]

        if (get_enrollment_html_id === ENROLLMENT_DATE) {
          const html_el = my_container.querySelector("[id='" + get_id + "']")
          html_el.innerHTML = current_tei.enrollments?.[0]?.enrollmentDate ? moment(current_tei.enrollments?.[0]?.enrollmentDate).format("YYYY-MM-DD") : ""
        }


        if (get_enrollment_html_id === INCIDENT_DATE) {
          const html_el = my_container.querySelector("[id='" + get_id + "']")
          html_el.innerHTML = current_tei.enrollments?.[0]?.incidentDate ? moment(current_tei.enrollments?.[0]?.incidentDate).format("YYYY-MM-DD") : ""
        }


        if (get_enrollment_html_id === ORGANISATION_UNIT_NAME) {
          const html_el = my_container.querySelector("[id='" + get_id + "']")
          html_el.innerHTML = current_tei.enrollments?.[0]?.orgUnitName || ""
        }
      }
    }


    // Interprétation des données sur les dataElements
    if (get_data_is === DATA_ELEMENT) {
      if (get_id) {

        const get_program_id = get_id.split('|')?.[0]
        const get_programStage_id = get_id.split('|')?.[1]
        const get_dataElement_id = get_id.split('|')?.[2]

        const html_el = my_container.querySelector("[id='" + get_id + "']")


        if (get_data_has_legend === "NO") {
          let found_element = null
          const actuel_event = current_tei?.enrollments[0]?.events?.filter(ev => ev.programStage === get_programStage_id)?.[0]


          if (actuel_event && actuel_event?.dataValues?.length > 0 && get_programStage_id === actuel_event?.programStage && get_program_id === selectedProgramTrackerFromHTML?.id) {

            found_element = actuel_event.dataValues.find(dv => dv.dataElement === get_dataElement_id)
          }


          if (found_element) {
            html_el.innerHTML = found_element.value
          }
        }

      }
    }


  }


}


export const injectDataIntoHtml = (dataValues, { html }, legends, orgUnits, levels, selectedOrgUnit) => {
  if (selectedOrgUnit) {
    let my_container = document.querySelector('[id="my-table-container"]')

    const html_elements_list = my_container.querySelectorAll('[data-type="AGGREGATE"]')

    for (let html_el of html_elements_list) {

      const html_ID = html_el.getAttribute('id')
      const data_has_legend = html_el.getAttribute('data-has-legend')
      const data_has_organisationUnitGroup = html_el.getAttribute('data-has-organisationUnitGroup')


      // if (dataValues.length === 0) {

      //   //  Gestion des valeurs manquant et les valeur non applicable
      //   if( dxElementID ){

      //     const dx_id = html_ID.split('|')?.[0]
      //     const ou_id = html_ID.split('|')?.[1]

      //     if(dx_id === dxElementID && ou_id){

      //     }

      //   }

      // } else {

      // If no legend 
      if (data_has_legend === 'NO' && html_ID) {

        const dx_id = html_ID.split('|')?.[0]
        const ou_id = html_ID.split('|')?.[1]

        if (dx_id && ou_id) {
          for (let dataValue of dataValues) {
            const dataElement = dataValue.dataElement
            const orgUnit = dataValue.orgUnit
            const value = dataValue.value

            const el = dataValue.categoryOptionCombo ? dataElement + "." + dataValue.categoryOptionCombo : dataElement

            if (
              el === dx_id &&
              orgUnit === getOrgUnitIdFromParentString(ou_id, selectedOrgUnit, orgUnits, levels)?.id
            ) {

              html_el.innerHTML = ""

              injectFromId(html_ID, value)

            }
          }
        }
      }

      if (data_has_legend === "YES" && html_ID) {

        const dx_id = html_ID.split('|')?.[0]
        const ou_id = html_ID.split('|')?.[1]
        const legend_id = html_ID.split('|')?.[2]
        const legend_type = html_ID.split('|')?.[3]

        if (dx_id && ou_id && legend_id && legend_type) {
          for (let dataValue of dataValues) {

            const dataElement = dataValue.dataElement
            const orgUnit = dataValue.orgUnit
            const value = dataValue.value
            const el = dataValue.categoryOptionCombo ? dataElement + "." + dataValue.categoryOptionCombo : dataElement

            if (
              el === dx_id &&
              orgUnit === getOrgUnitIdFromParentString(ou_id, selectedOrgUnit, orgUnits, levels)?.id
            ) {

              switch (legend_type) {
                case "color":
                  checkColorLegend(legend_id, legends, html_ID, value)
                  break

                case "label":
                  checkLabelLegend(legend_id, legends, html_ID, value)
                  break

                case "image":
                  checkImageLegend(legend_id, legends, html_ID, value)
                  break

                case "pie":
                  drawCamember(legend_id, legends, html_ID, value, html_el)
                  break

                default:
                  break
              }

            }
          }


        }

      }

    }
  }

}


export const generateTreeFromOrgUnits = (ouList = [], icon = null, parentId = null, level = 1, setLoading) => {
  setLoading && setLoading(true)
  let orgUnits = ouList.map(o => {
    return {
      key: o.id,
      id: o.id,
      label: o.displayName,
      title: o.displayName,
      data: o,
      level: o.level,
      value: o.id,
      icon: icon,
      children: [],
      parent: (o.parent !== null && o.parent !== undefined) ? o.parent.id : null
    }
  })

  let nodes = parentId ? orgUnits.filter(o => o.id === parentId) : orgUnits.filter(o => o.level === level)

  nodes.forEach(o => {
    o.children = orgUnits.filter(org => org.parent === o.id)

    o.children.forEach(a => {
      a.children = orgUnits.filter(org => org.parent === a.id)

      a.children.forEach(b => {
        b.children = orgUnits.filter(org => org.parent === b.id)

        b.children.forEach(c => {
          c.children = orgUnits.filter(org => org.parent === c.id)

          c.children.forEach(d => {
            d.children = orgUnits.filter(org => org.parent === d.id)

            d.children.forEach(e => {
              e.children = orgUnits.filter(org => org.parent === e.id)

              e.children.forEach(f => {
                f.children = orgUnits.filter(org => org.parent === f.id)

                f.children.forEach(g => {
                  g.children = orgUnits.filter(org => org.parent === g.id)

                  g.children.forEach(h => {
                    h.children = orgUnits.filter(org => org.parent === h.id)

                    h.children.forEach(i => {
                      i.children = orgUnits.filter(org => org.parent === i.id)

                      i.children.forEach(j => {
                        j.children = orgUnits.filter(org => org.parent === j.id)

                        j.children.forEach(k => {
                          k.children = orgUnits.filter(org => org.parent === k.id)

                          k.children.forEach(l => {
                            l.children = orgUnits.filter(org => org.parent === l.id)

                            l.children.forEach(m => {
                              m.children = orgUnits.filter(org => org.parent === m.id)

                              m.children.forEach(n => {
                                n.children = orgUnits.filter(org => org.parent === n.id)

                                n.children.forEach(p => {
                                  p.children = orgUnits.filter(org => org.parent === p.id)

                                  p.children.forEach(q => {
                                    q.children = orgUnits.filter(org => org.parent === q.id)

                                    q.children.forEach(r => {
                                      r.children = orgUnits.filter(org => org.parent === r.id)

                                      r.children.forEach(s => {
                                        s.children = orgUnits.filter(org => org.parent === s.id)

                                        s.children.forEach(t => {
                                          t.children = orgUnits.filter(org => org.parent === t.id)

                                          t.children.forEach(u => {
                                            u.children = orgUnits.filter(org => org.parent === u.id)

                                            u.children.forEach(v => {
                                              v.children = orgUnits.filter(org => org.parent === v.id)

                                              v.children.forEach(w => {
                                                w.children = orgUnits.filter(org => org.parent === w.id)

                                                w.children.forEach(x => {
                                                  x.children = orgUnits.filter(org => org.parent === x.id)

                                                  x.children.forEach(y => {
                                                    y.children = orgUnits.filter(org => org.parent === y.id)

                                                    y.children.forEach(z => {
                                                      z.children = orgUnits.filter(org => org.parent === z.id)
                                                    })
                                                  })
                                                })
                                              })
                                            })
                                          })
                                        })
                                      })
                                    })
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  setLoading && setLoading(false)

  return nodes
}


//  Cette fonction prend la chaine de string ( parent 1 ) et retourne l'org unit correspondant (ouId) 
export const getOrgUnitIdFromParentString = (parent_string, selectedOU, orgUnits, orgUnitLevels) => {
  if (parent_string) {
    if (parent_string === CURRENT) {
      return orgUnits.find(ou => ou.id === selectedOU)
    } else {
      if (orgUnitLevels && orgUnitLevels.length > 0) {
        //  récuperation de l'object selected ou
        const selectedOu_object = orgUnits.find(ou => ou.id === selectedOU)

        // Récuperation de l'index
        const parent_string_index = parent_string.split('_')?.[1]

        let corresponding_parent_level = null

        // recuperation du level du parent potentiel 
        if ((selectedOu_object.level - parent_string_index) > 0) {
          corresponding_parent_level = selectedOu_object.level - parent_string_index
        }

        // vérification dans le passe du selected ou s'il y a un parent avec le corresponding_parent_level trouver
        if (corresponding_parent_level) {
          const selectedOu_parent_path_list = selectedOu_object.path.split('/')
          let new_selectOU_parent_path_list = []
          for (let path_id of selectedOu_parent_path_list) {
            const newObject = orgUnits.find(ou => ou.id === path_id)
            if (newObject) {
              new_selectOU_parent_path_list.push(newObject)
            }
          }

          // recherche du parent trouver
          const parent_found = new_selectOU_parent_path_list.find(ou => ou.level === corresponding_parent_level)
          return parent_found
        }

      }
    }
  }
}


export const getOrgUnitParentFromHtml = (selectedOU, orgUnits, orgUnitLevels) => {
  let uid_list = []
  const id_html_list = document.querySelector('[id="my-table-container"]')?.querySelectorAll("[data-type='AGGREGATE']") || []

  if (id_html_list && id_html_list.length > 0) {
    for (let id_html of id_html_list) {
      const id_string = id_html.getAttribute('id')
      if (id_string) {
        const orgUnit_parent_name = id_string.split('|')?.[1]
        if (orgUnit_parent_name) {
          const parent_object = getOrgUnitIdFromParentString(orgUnit_parent_name, selectedOU, orgUnits, orgUnitLevels)
          if (parent_object) {
            if (!uid_list.includes(parent_object.id)) {
              uid_list.push(parent_object.id)
            }
          }
        }
      }
    }
  }


  return uid_list
}




export const getFileAsBase64 = (file) => {
  if (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => resolve(reader.result)
      reader.onerror = err => reject(err)
    })
  }
}


export const getAggregateDimensionsList = report => {
  let dimensions = []
  if (report) {
    let parser = new DOMParser()
    const doc = parser.parseFromString(report.html, 'text/html')
    if (doc) {
      const aggregateElements = doc.querySelectorAll('[data-type="AGGREGATE"]')
      for (let el of aggregateElements) {
        const id = el.getAttribute('id')
        const dx = id?.split('|')?.[0]
        if (dx) {
          dimensions.push(dx)
        }
      }
    }
  }

  return dimensions
}


export const cleanAggrateDimensionData = (report, legends, dimensions) => {
  if (report) {
    let parser = new DOMParser()
    const aggregateElements = document.querySelectorAll('[data-type="AGGREGATE"]')
    for (let el of aggregateElements) {


      const el_ID = el.getAttribute('id')
      const legend_id = el_ID.split('|')?.[2]
      const legend_type = el_ID.split('|')?.[3]
      const data_has_organisationUnitGroup = el.getAttribute('data-has-organisationunitgroup')

      dimensions.forEach(d => {

        if (el_ID.includes(d)) {

          const current_legend = legends.find(leg => leg.id === legend_id)

          if (current_legend && current_legend.items?.length > 0) {

            if (!data_has_organisationUnitGroup || data_has_organisationUnitGroup === "NO") {// ====> VALEUR MANQUANTE
              defaultMissingValueToApply(el_ID, current_legend)
            }

            if (data_has_organisationUnitGroup === "YES") {  // ====> NON APPLICABLE 
              defaultValueToApply(el_ID, current_legend)
            }
          }

        }
      })
    }
    // }
  }
}


export const updateAndInjectSchoolNames = (report, selectedOu, organisationUnits = [], organisationUnitLevels) => {
  if (report) {
    const otherElementsHTML = document.querySelectorAll('[data-type="'.concat(OTHER_ELEMENT).concat('"]'))

    for (let el of otherElementsHTML) {

      const data_is = el.getAttribute('data-is')

      if (data_is === ORGANISATION_UNIT_NAME) {

        el.innerHTML = ""
        const id_string = el.getAttribute('id')

        const ouNames = []

        const htmlOUList = id_string?.split('|')

        for (let htmlOu of htmlOUList) {
          const name_found = getOrgUnitIdFromParentString(htmlOu, selectedOu, organisationUnits, organisationUnitLevels)
          if (name_found) {
            ouNames.push(name_found)
          }
        }


        el.innerHTML = ouNames.map(ouName => ouName.name).join(" - ")
      }
    }

  }
}

export const updateAndInjectOtherElementPeriod = (report, selectedDate) => {
  if (report) {
    const otherElementsHTML = document.querySelectorAll('[data-type="'.concat(OTHER_ELEMENT).concat('"]'))

    for (let el of otherElementsHTML) {

      const data_is = el.getAttribute('data-is')

      if (data_is === SELECTED_DATE) {

        el.innerHTML = ""
        el.innerHTML = selectedDate

      }
    }
  }
}