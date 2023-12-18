

import axios from "axios"
import dayjs from "dayjs"
import { TRACKER_ENTITY_INSTANCES_ROUTE, DATA_STORE_ROUTE } from "../api.routes"
import { ATTRIBUTE, COLOR, CURRENT, DATA_ELEMENT, DATE, DAY, ENROLLMENT, ENROLLMENT_DATE, IMAGE, INCIDENT_DATE, LABEL, MONTH, NOTIFICATON_WARNING, ORGANISATION_UNIT_NAME, OTHER_ELEMENT, SELECTED_DATE, TRACKER, YEAR } from "./constants"

const drawCamember = async (legendTypeId, attribute_code, value, period, setNotif, periodType, legendContentList) => {

  const current_legend_parent = legendContentList?.find(leg => leg.id === legendTypeId)
  const current_legend = findTheRightLegend(current_legend_parent, period, periodType)

  const current_html_element = document.getElementById(attribute_code)
  console.log("attribut code : ", attribute_code)

  console.log(current_html_element)

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
          }
          ]
        }
      })
    }
  } else {
    injectFromId(attribute_code, value)
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

const defaultNotApplicableValueToApply = (attribute, item) => {

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
  try {

    if (item.defaultType === COLOR && item.missingData) {
      injectFromId(attribute, '<span style="color: ' + item.missingData + '; height:100%; width: 100%;"></span>')
    }

    if (item.defaultType === IMAGE && item.missingData) {
      injectFromId(attribute, "<img src='" + item.missingData + "' style='width: 40px; height:40px;' />")
    }

    if (item.defaultType === LABEL && item.missingData) {
      injectFromId(attribute, "<span>" + item.missingData + "</span>")
    }
  } catch (err) { }
}

const findTheRightLegend = (currentLegendParent, period, periodType) => {
  if (!currentLegendParent)
    return null

  let currentLegend = null
  const legendSetListKey = Object.keys(currentLegendParent?.periods)

  if (periodType === YEAR) {
    const legendWithNoEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? false : true) || []
    const legendWithEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? true : false) || []

    if (legendWithNoEndDate?.length > 0 && parseInt(dayjs(legendWithNoEndDate[0]).format('YYYY')) <= parseInt(dayjs(period).format('YYYY'))) {
      currentLegend = currentLegendParent?.periods[`${legendWithNoEndDate[0]}`]
    } else {

      const filteredLegend = legendWithEndDate.reduce((prev, current) => {
        const start = parseInt(dayjs(current.split('_')[0]).format('YYYY'))
        const end = parseInt(dayjs(current.split('_')[1]).format('YYYY'))
        const dateChoosed = parseInt(dayjs(period).format('YYYY'))

        if (start <= dateChoosed && dateChoosed <= end) {
          prev.push(current)
        }

        return prev
      }, [])

      currentLegend = currentLegendParent?.periods[`${filteredLegend[0]}`]
    }
  }

  if (periodType === MONTH) {
    const legendWithNoEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? false : true) || []
    const legendWithEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? true : false) || []

    if (legendWithNoEndDate?.length > 0 && (dayjs(legendWithNoEndDate[0]).startOf('month').isBefore(dayjs(period).startOf('month')) || dayjs(legendWithNoEndDate[0]).startOf('month').isSame(dayjs(period).startOf('month')))) {
      currentLegend = currentLegendParent?.periods[`${legendWithNoEndDate[0]}`]
    } else {

      const filteredLegend = legendWithEndDate.reduce((prev, current) => {
        const start = dayjs(current.split('_')[0]).startOf('month')
        const end = dayjs(current.split('_')[1]).endOf('month')
        const dateChoosed = dayjs(period).startOf('month')

        if ((dayjs(start).isBefore(dateChoosed) || dayjs(start).isSame(dateChoosed)) && (dayjs(dateChoosed).isBefore(end) || dayjs(dateChoosed).isSame(end))) {
          prev.push(current)
        }

        return prev
      }, [])

      currentLegend = currentLegendParent?.periods[`${filteredLegend[0]}`]
    }
  }

  if (periodType === DAY) {
    const legendWithNoEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? false : true) || []
    const legendWithEndDate = legendSetListKey.filter(l => l?.split('_')[1] ? true : false) || []

    if (legendWithNoEndDate?.length > 0 && (dayjs(legendWithNoEndDate[0]).isBefore(dayjs(period)) || dayjs(legendWithNoEndDate[0]).isSame(dayjs(period)))) {
      currentLegend = currentLegendParent?.periods[`${legendWithNoEndDate[0]}`]
    } else {

      const filteredLegend = legendWithEndDate.reduce((prev, current) => {
        const start = dayjs(current.split('_')[0])
        const end = dayjs(current.split('_')[1])
        const dateChoosed = dayjs(period)

        if ((dayjs(start).isBefore(dateChoosed) || dayjs(start).isSame(dateChoosed)) && (dayjs(dateChoosed).isBefore(end) || dayjs(dateChoosed).isSame(end))) {
          prev.push(current)
        }

        return prev
      }, [])

      currentLegend = currentLegendParent?.periods[`${filteredLegend[0]}`]
    }
  }

  return currentLegend
}

const displayNotificationIfLegendIsNotSet = (setNotif, legendName, period) => {
  setNotif({ show: true, message: `Some legends have not been configured for the selected period ( ${dayjs(period).format('YYYY')} ) , the values ​​will be displayed instead of these legends ! `, type: NOTIFICATON_WARNING })
}

const checkLabelLegend = async (legendTypeId, attribute_code, value, period, setNotif, periodType, legendContentList) => {
  const current_legend_parent = legendContentList?.find(leg => leg.id === legendTypeId)
  const current_legend = findTheRightLegend(current_legend_parent, period, periodType)

  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {
      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, '<span>' + item.name + '</span>')
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) === parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, '<span>' + item.name + '</span>')
      }
    }

  } else {
    injectFromId(attribute_code, value)
    displayNotificationIfLegendIsNotSet(setNotif, current_legend_parent?.name, period)
  }
}

const checkColorLegend = async (legendTypeId, attribute_code, value, period, setNotif, periodType, legendContentList) => {
  const current_legend_parent = legendContentList?.find(leg => leg.id === legendTypeId)

  const current_legend = findTheRightLegend(current_legend_parent, period, periodType)


  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {

      if (!item.color) {
        injectFromId(attribute_code, value)
        return setNotif({
          show: true,
          message: `You try to display some colors that have not been configurated for the selected period ( ${dayjs(period).format('YYYY')} ) , the values ​​will be displayed instead of these legends ! `,
          type: NOTIFICATON_WARNING
        })
      }


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

  } else {
    injectFromId(attribute_code, value)
    displayNotificationIfLegendIsNotSet(setNotif, current_legend_parent?.name, period)
  }
}

const checkImageLegend = async (legendTypeId, attribute_code, value, period, setNotif, periodType, legendContentList) => {

  const current_legend_parent = legendContentList?.find(leg => leg.id === legendTypeId)
  const current_legend = findTheRightLegend(current_legend_parent, period, periodType)

  if (current_legend && current_legend.items?.length > 0) {
    for (let item of current_legend.items) {
      if (!item.image) {
        injectFromId(attribute_code, value)
        return setNotif({
          show: true,
          message: `You try to display some images that have not been configurated for the selected period ( ${dayjs(period).format('YYYY')} ) , the values ​​will be displayed instead of these legends ! `,
          type: NOTIFICATON_WARNING

        })
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) < parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, "<img src='" + item.image + "' style='width: 40px; height:40px;' />")
      }

      if (parseFloat(parseFloat(value).toFixed(4)) >= parseFloat(parseFloat(item.start).toFixed(4)) && parseFloat(parseFloat(value).toFixed(4)) === parseFloat(parseFloat(item.end).toFixed(4))) {
        injectFromId(attribute_code, "<img src='" + item.image + "' style='width: 40px; height:40px;' />")
      }
    }
  } else {
    injectFromId(attribute_code, value)
    displayNotificationIfLegendIsNotSet(setNotif, current_legend_parent?.name, period)
  }
}

const inject_legend = (legendType, legendId, attribute_code, value, period, setNotif, periodType, legendContentList) => {
  if (legendType && legendId && attribute_code && value && period) {
    switch (legendType) {
      case "color":
        checkColorLegend(legendId, attribute_code, value, period, setNotif, periodType, legendContentList)
        break

      case "label":
        checkLabelLegend(legendId, attribute_code, value, period, setNotif, periodType, legendContentList)
        break

      case "image":
        checkImageLegend(legendId, attribute_code, value, period, setNotif, periodType, legendContentList)
        break

      case "pie":
        drawCamember(legendId, attribute_code, value, html_id_code, period, setNotif, periodType, legendContentList)
        break

      default:
        break
    }
  }
}

export const inject_tei_into_html = (report, current_tei, selectedProgramTrackerFromHTML, setNotif) => {

  if (!selectedProgramTrackerFromHTML)
    return null

  if (!current_tei)
    return null

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
            inject_legend(get_legend_type, get_legend_ID, get_id, attribute_found.value, setNotif)
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
          html_el.innerHTML = current_tei.enrollments?.[0]?.enrollmentDate ? dayjs(current_tei.enrollments?.[0]?.enrollmentDate).format("YYYY-MM-DD") : ""
        }


        if (get_enrollment_html_id === INCIDENT_DATE) {
          const html_el = my_container.querySelector("[id='" + get_id + "']")
          html_el.innerHTML = current_tei.enrollments?.[0]?.incidentDate ? dayjs(current_tei.enrollments?.[0]?.incidentDate).format("YYYY-MM-DD") : ""
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

export const injectDataIntoHtml = (dataValues, { html }, orgUnits, levels, selectedOrgUnit, period, periodType, setNotif, legendContentList) => {
  if (selectedOrgUnit) {
    let my_container = document.querySelector('[id="my-table-container"]')


    const html_elements_list = my_container.querySelectorAll('[data-type="AGGREGATE"]')

    for (let html_el of html_elements_list) {
      const html_ID = html_el.getAttribute('id')
      const data_has_legend = html_el.getAttribute('data-has-legend')

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
                  checkColorLegend(legend_id, html_ID, value, period, setNotif, periodType, legendContentList)
                  break

                case "label":
                  checkLabelLegend(legend_id, html_ID, value, period, setNotif, periodType, legendContentList)
                  break

                case "image":
                  checkImageLegend(legend_id, html_ID, value, period, setNotif, periodType, legendContentList)
                  break

                case "pie":
                  drawCamember(legend_id, html_ID, value, period, setNotif, periodType, legendContentList)
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

export const cleanAggrateDimensionData = (report, dimensions, period, periodType, selectedOU, orgUnits, orgUnitLevels, legendContentList, organisationUnitGroups) => {
  if (report) {
    const aggregateElements = document.querySelectorAll('[data-type="AGGREGATE"]')
    for (let el of aggregateElements) {
      const el_ID = el?.getAttribute('id')
      const legend_id = el_ID?.split('|')?.[2]
      const data_has_organisationUnitGroup = el.getAttribute('data-has-organisationunitgroup')
      const OrgUnitString = el_ID?.split('|')?.[1]

      el.innerHTML = ""
      el.style.background = "transparent"
      el.style.color = "#000000"

      for (let d of dimensions) {
        if (el_ID?.includes(d) && legend_id) {

          const current_legend_parent = legendContentList.find(leg => leg.id === legend_id)
          const current_legend = findTheRightLegend(current_legend_parent, period, periodType)

          if (current_legend_parent && current_legend) {
            if (!data_has_organisationUnitGroup || data_has_organisationUnitGroup === "NO") {// ====> VALEUR MANQUANTE
              defaultMissingValueToApply(el_ID, current_legend)
            }

            // ====> NON APPLICABLE legend
            if (data_has_organisationUnitGroup === "YES") {
              const ouGId = el_ID?.split('|')?.[4]
              const ou = getOrgUnitIdFromParentString(OrgUnitString, selectedOU, orgUnits, orgUnitLevels)

              if (ou && ouGId) {
                if (checkIfOuInGroup(ouGId, ou.id, organisationUnitGroups)) {
                  defaultMissingValueToApply(el_ID, current_legend)
                } else {
                  defaultNotApplicableValueToApply(el_ID, current_legend)
                }
              } else {
                defaultNotApplicableValueToApply(el_ID, current_legend)
              }
            }
          }
        }
      }
    }
  }
}

const checkIfOuInGroup = (ouGId, ou_id, organisationUnitGroups) => {
  try {
    const organisatinUnitGroup = organisationUnitGroups.find(ouG => ouG.id === ouGId)

    if (organisatinUnitGroup?.organisationUnits.map(ou => ou.id).includes(ou_id)) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
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


export const updateAndInjectOtherElementPeriod = (report, selectedDate, selectedPeriodType) => {
  if (report) {
    const otherElementsHTML = document.querySelectorAll('[data-type="'.concat(OTHER_ELEMENT).concat('"]'))

    for (let el of otherElementsHTML) {
      const data_is = el.getAttribute('data-is')

      if (data_is === SELECTED_DATE) {

        el.innerHTML = ""
        el.innerHTML = formatPeriodForAnalytic(selectedDate, selectedPeriodType)

      }
    }
  }
}

export const loadDataStore = async (key_string, setLoading, setState, payload = null) => {
  try {

    if (!key_string)
      throw new Error('Please specify the key_string of the datastore to retrieve')

    setLoading && setLoading(true)

    const route = `${DATA_STORE_ROUTE}/${process.env.REACT_APP_DATA_STORE_NAME}/${key_string}`
    const response = await axios.get(route)
    const data = response.data

    setState && setState(data)
    setLoading && setLoading(false)
    return data
  } catch (err) {
    setLoading && setLoading(false)
    await createDataToDataStore(key_string, payload ? payload : [])
  }
}

export const saveDataToDataStore = async (key_string, payload, setLoading, setState, setErrorMessage, createIfNotExist = false) => {
  try {

    if (!key_string)
      throw new Error('Please specify the key_string of the datastore to retrieve')

    if (!payload)
      throw new Error('Please add the payload to save in the datastore !')

    setLoading && setLoading(true)
    const route = `${DATA_STORE_ROUTE}/${process.env.REACT_APP_DATA_STORE_NAME}/${key_string}`
    let response = null

    if (createIfNotExist) {
      //  The will first check if this key exist before make some put (update) or make post ( create new )
      try {
        await loadDataStore(key_string, null, null, {})
      } catch (err) {
      }
    }

    response = await axios.put(route, payload)

    const data = response?.data

    setState && setState(data)
    setLoading && setLoading(false)

    return true

  } catch (err) {
    setErrorMessage && setErrorMessage(err.message)
    setLoading && setLoading(false)
    throw err
  }
}

export const createDataToDataStore = async (key_string, payload) => {
  try {

    if (!key_string)
      throw new Error('Please specify the key_string of the datastore to retrieve')

    const route = `${DATA_STORE_ROUTE}/${process.env.REACT_APP_DATA_STORE_NAME}/${key_string}`
    await axios.post(route, payload || [])

    return true

  } catch (err) {
    throw err
  }
}

export const deleteKeyFromDataStore = async (key_string) => {
  try {

    if (!key_string)
      throw new Error('Please specify the key_string of the datastore to retrieve')

    const route = `${DATA_STORE_ROUTE}/${process.env.REACT_APP_DATA_STORE_NAME}/${key_string}`
    await axios.delete(route)

    return true

  } catch (err) {
    // throw err
  }
}

export const formatPeriodForAnalytic = (period, periodType) => {
  if (periodType === DAY)
    return dayjs(period).format('YYYYMMDD')
  if (periodType === YEAR)
    return dayjs(period).format('YYYY')
  if (periodType === MONTH)
    return dayjs(period).format('YYYYMM')
}