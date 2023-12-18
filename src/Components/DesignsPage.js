
import React, { useState } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalActions,
  ModalTitle,
  ButtonStrip,
  Input,
  NoticeBox,
  Field,
  CircularLoader,
  SingleSelect,
  SingleSelectOption,
  Table,
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
  Radio,
  Checkbox,
} from '@dhis2/ui'

import { QuestionCircleOutlined } from '@ant-design/icons';

import { v4 as uuid } from 'uuid'
import Scrollbars from 'react-custom-scrollbars-2'
import TrackerDimensionsDialog from './TrackerDimensionsDialog'
import { BiEdit } from 'react-icons/bi'
import { RiDeleteBinLine } from 'react-icons/ri'
import dayjs from 'dayjs'
import { CgCloseO } from 'react-icons/cg'
import { AGGREGATE, ATTRIBUTE, CATEGORY_COMBO, CURRENT_ORG_UNIT_OBJECT, DATA_ELEMENT, DATA_SET, DATA_SET_EVENT, DATE, ENROLLMENT, ENROLLMENT_DATE, INCIDENT_DATE, INDICATOR, NOTIFICATON_CRITICAL, NOTIFICATON_SUCCESS, ORGANISATION_UNIT_NAME, OTHER_ELEMENT, PROGRAM_INDICATOR, SELECTED_DATE, TRACKER } from '../utils/constants'
import { Popconfirm, Segmented } from 'antd'
import { DataDimension } from '@dhis2/analytics'
import { IoSettingsOutline } from 'react-icons/io5'
import { AiOutlineSearch } from 'react-icons/ai'
import { AiFillCloseCircle } from 'react-icons/ai'
import { loadDataStore, saveDataToDataStore, deleteKeyFromDataStore } from '../utils/fonctions'

const summernoteConfig = {
  height: 500,
  placeholder: 'type with apple, orange, watermelon and lemon',

  hint: {
    words: ['apple', 'orange', 'watermelon', 'lemon'],
    match: /\b(\w{1,})$/,
    search: function (keyword, callback) {
      callback($.grep(this.words, function (item) {
        return item.indexOf(keyword) === 0;
      }));
    }
  },

  popover: {
    table: [
      ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
      ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
      ['custom', ['tableHeaders']]
    ],
  },

  save: {
    lang: 'en-US' // Change to your chosen language
  },

  toolbar: [
    ['img', ['picture']],
    ['style', ['style', 'addclass', 'clear']],
    ['fontstyle', ['bold', 'italic', 'ul', 'ol', 'link', 'paragraph']],
    ['fontstyleextra', ['strikethrough', 'underline', 'hr', 'color', 'superscript', 'subscript', 'add-text-tags', 'fontname']],
    ['extra', ['video', 'table']],
    ['misc', ['undo', 'redo', 'codeview', 'fullscreen', 'height', 'help']],
  ],
}

const DesignsPage = ({
  organisationUnitLevels,
  organisationUnitGroups,
  legends,
  reports,
  setReports,
  loadingReports,
  setLoadingReports,
  loadingLegendContents,
  setNotif
}) => {

  const [reportName, setReportName] = useState(null)
  const [checkedKeys, setCheckedKeys] = useState(null)
  const [currentHtmlTagSelected, setCurrentHtmlTagSelected] = useState(null)
  const [tabPage, setTabPage] = useState("DIMENSION")
  const [legendToUse, setLegendToUse] = useState(null)
  const [editReport, setEditReport] = useState(false)
  const [searchProperties, setSearchProperties] = useState([])
  const [activeElementID, setActiveElementID] = useState(null)
  const [currentRepport, setCurrentReport] = useState(null)
  const [currentRepportContent, setCurrentReportContent] = useState(null)
  const [currentDimensionSelected, setCurrentDimensionSelected] = useState(null)
  const [isSearchMode, setSearchMode] = useState(false)
  const [searchInAllInput, setSearchInAllInput] = useState("")

  const [selectedConfigDimensionsAggregate, setSelectedConfigDimensionsAggregate] = useState([])
  const [selectedTypeLegendToDisplay, setSelectedTypeLegendToDisplay] = useState(null)
  const [selectedOuLevelToDisplay, setSelectedOuLevelToDisplay] = useState(null)
  const [selectedOuGroupToDisplay, setSelectedOuGroupToDisplay] = useState(null)
  const [selectedDimensionContentToDisplay, setSelectedDimensionContentToDisplay] = useState(AGGREGATE.value)
  const [selectedRadioTypeLegend, setSelectedRadioTypeLegend] = useState("VALUE")
  const [selectedTrackerConfigDimensionsPrograms, setSelectedTrackerConfigDimensionsPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedProgramToDisplay, setSelectedProgramToDisplay] = useState(null)
  const [selectedRadioDataToDisplay, setSelectedRadioDataToDisplay] = useState(ATTRIBUTE)
  const [selectedProgramStageToDisplay, setSelectedProgramStageToDisplay] = useState(null)
  const [selectedDataElementDimensionToDisplay, setSelectedDataElementDimensionToDisplay] = useState(null)
  const [selectedAttributeToDisplay, setSelectedAttributeToDisplay] = useState(null)
  const [selectedEnrollmentDataToDisplay, setSelectedEnrollmentDataToDisplay] = useState(null)
  const [selectedAttributeValueTypeToDisplay, setSelectedAttributeValueTypeToDisplay] = useState(null)
  const [_, setSelectedAttributeIsSearchable] = useState(false)
  const [selectedOtherOrganisationUnitElements, setSelectedOtherOrganisationUnitElements] = useState([])

  const [visibleSaveModal, setVisibleSaveModal] = useState(false)
  const [visibleSelectDXTitle, setVisibleSelectDXTitle] = useState(false)
  const [visibleConfigurationModal, setVisibleConfigurationModal] = useState(false)
  const [visibleAddReport, setVisibleAddReport] = useState(false)
  const [visibleSelectDXTrackerModal, setVisibleSelectDXTrackerModal] = useState(false)
  const [visibleSelectDXAggregateModal, setVisibleSelectDXAggregateModal] = useState(false)

  const [visibleOtherOrganisationUnitElementModal, setVisibleOtherOrganisationUnitElementModal] = useState(false)

  const [loadingInitState, setLoadingInitState] = useState(false)
  const [loadingProcess, setLoadingProcess] = useState(false)

  const initSummernote = (existing_html) => {
    window.$(document).ready(function () {
      if (existing_html) {
        $('#summernote').html(existing_html)
      }
      window.$('#summernote').summernote({
        ...summernoteConfig,
        callbacks: {
          onInit: function (event) {
            $(".note-editable").on('click', function (e) {
              setCurrentHtmlTagSelected(e.target)
              const targetID = e.target.id
              if (targetID) {
                const textContent = document.getElementById(targetID).textContent
                if (!textContent || textContent.length === 0) {
                  document.getElementById(targetID).innerHTML = ""
                  document.getElementById(targetID).removeAttribute('id')
                }
              }
            })
          }
        }
      })
    })
  }

  const initState = async (curr, currContent) => {
    try {
      if (curr && currContent) {
        setLoadingInitState(true)

        setReportName(curr.name)
        setCurrentReport(curr)
        setCurrentReportContent(currContent)

        initSummernote(currContent.html)
        setLoadingInitState(false)
        setSelectedProgram(currContent.selectedProgram)
        setSearchProperties(currContent.searchProperties)
      } else {
        setVisibleAddReport(false)
        setEditReport(false)
        cleanStateAfterReportSaved()
      }

    } catch (err) {
      setNotif({ show: true, type: NOTIFICATON_CRITICAL, message: err.message })
      setLoadingInitState(false)

    }
  }

  const handleSaveReport = async () => {
    try {
      setLoadingProcess(true)
      const html_code = window.$('#summernote').summernote('code')

      if (!reportName || reportName.trim() === "")
        throw new Error("Report name is required ")

      if (!html_code || html_code.trim() === "")
        throw new Error("Html must not empty")



      let payload = {}
      let payloadReportContent = {}
      const refreshReportList = await loadDataStore(process.env.REACT_APP_REPORTS_KEY, null, null, [])
      console.log("refreshReportList:", refreshReportList)

      if (editReport && currentRepport && currentRepportContent) {

        payload = refreshReportList.map(rep => {
          if (rep.id === currentRepport.id) {
            return {
              ...rep,
              name: reportName,
              updatedAt: dayjs(),
            }
          } else {
            return rep
          }
        })

        const refreshCurrentReportContent = await loadDataStore(`REPORT_${currentRepport.id}`, null, null, {})
        console.log("refreshCurrentReportContent: ", refreshCurrentReportContent)

        payloadReportContent = {
          ...refreshCurrentReportContent,
          html: html_code,
          selectedProgram: selectedProgram,
          name: reportName,
          updatedAt: dayjs(),
          searchProperties
        }

      } else {
        const reportId = uuid()

        if (refreshReportList.map(r => r.name).includes(reportName))
          throw new Error("This report is already created ( May be you can change the name ) ")

        payload = [
          {
            id: reportId,
            name: reportName,
            createdAt: dayjs(),
            updatedAt: dayjs(),
          },
          ...refreshReportList
        ]

        payloadReportContent = {
          id: reportId,
          name: reportName,
          html: html_code,
          searchProperties,
          selectedProgram: selectedProgram,
          createdAt: dayjs(),
          updatedAt: dayjs(),
        }
      }

      await saveDataToDataStore(process.env.REACT_APP_REPORTS_KEY, payload, null, null, null)
      await saveDataToDataStore(`REPORT_${payloadReportContent.id}`, payloadReportContent, null, null, null, true)
      loadDataStore(process.env.REACT_APP_REPORTS_KEY, setLoadingReports, setReports, [])

      cleanStateAfterReportSaved()
      setEditReport(false)
      setVisibleAddReport(false)
      setVisibleSaveModal(false)
      setLoadingProcess(false)
      setNotif({ show: true, message: 'Report saved !', type: NOTIFICATON_SUCCESS })

    } catch (err) {
      setLoadingProcess(false)
      setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
    }
  }

  const cleanStateAfterReportSaved = () => {
    setCurrentReport(null)
    setCurrentReportContent(null)
    setReportName(null)

    setCheckedKeys(null)
    setSelectedTypeLegendToDisplay(null)
    setSelectedOuLevelToDisplay(null)
    setCurrentHtmlTagSelected(null)
    $('#summernote').html("<div></div>")
  }

  const handleCloseSaveModal = () => {
    setVisibleSaveModal(false)
  }

  const handleCloseSaveTrackerDimensionModal = () => {
    setVisibleSelectDXTrackerModal(false)
    setSelectedOuLevelToDisplay(null)
    setSelectedTypeLegendToDisplay(null)
    setSelectedProgramToDisplay(null)
    setSelectedRadioDataToDisplay(ATTRIBUTE)
    cleanStateAfterInjectTrackerIds()
  }

  const handleCloseSaveAggregateDimensionModal = () => {
    setVisibleSelectDXAggregateModal(false)
    setSelectedOuLevelToDisplay(null)
    setSelectedTypeLegendToDisplay(null)
  }


  const handleClickOnAggregateDimensionElement = dx => {
    if (currentHtmlTagSelected && currentHtmlTagSelected !== "") {
      setCurrentDimensionSelected(dx)
      setVisibleSelectDXAggregateModal(true)
    }
  }



  const handleInjectTrackerIds = () => {

    if (selectedRadioDataToDisplay && selectedProgramToDisplay) {
      let id_string = ""
      let name_string = ""
      let has_legend = "NO"

      // If ATTRIBUTE
      if (selectedRadioDataToDisplay === ATTRIBUTE && selectedAttributeToDisplay) {

        if (selectedRadioTypeLegend === "VALUE") {
          id_string =
            "".concat(selectedProgramToDisplay.id)
              .concat('|')
              .concat(selectedAttributeToDisplay.id)

          name_string =
            "".concat(selectedProgramToDisplay.name)
              .concat('|')
              .concat(selectedAttributeToDisplay.name)

          has_legend = "NO"
        }

        if (selectedRadioTypeLegend === "LEGEND") {
          id_string =
            "".concat(selectedProgramToDisplay.id)
              .concat('|')
              .concat(selectedAttributeToDisplay.id)
              .concat('|')
              .concat(legendToUse)
              .concat('|')
              .concat(selectedTypeLegendToDisplay)

          name_string =
            "".concat(selectedProgramToDisplay.name)
              .concat('|')
              .concat(selectedAttributeToDisplay.name)
              .concat('|')
              .concat(legendToUse && legends.find(l => l.id === legendToUse)?.name || '')
              .concat('|')
              .concat(selectedTypeLegendToDisplay)

          has_legend = "YES"
        }


        window.$(currentHtmlTagSelected).attr("id", id_string)
        window.$(currentHtmlTagSelected).attr("data-type", 'TRACKER')
        window.$(currentHtmlTagSelected).attr("data-has-legend", has_legend)
        window.$(currentHtmlTagSelected).attr("data-is", ATTRIBUTE)
        selectedAttributeValueTypeToDisplay && window.$(currentHtmlTagSelected).attr("data-attribute-value-type", selectedAttributeValueTypeToDisplay)
        // selectedAttributeIsSearchable && window.$(currentHtmlTagSelected).attr("data-isSearchable", 'YES')
        window.$(currentHtmlTagSelected).html('')
        window.$(currentHtmlTagSelected).html(name_string)
      }

      // IF DATA ELEMENT
      if (selectedRadioDataToDisplay === DATA_ELEMENT && selectedDataElementDimensionToDisplay && selectedProgramStageToDisplay) {

        if (selectedRadioTypeLegend === "VALUE") {
          id_string =
            "".concat(selectedProgramToDisplay.id)
              .concat('|')
              .concat(selectedProgramStageToDisplay.id)
              .concat('|')
              .concat(selectedDataElementDimensionToDisplay.id)


          name_string =
            "".concat(selectedProgramToDisplay.name)
              .concat('|')
              .concat(selectedProgramStageToDisplay.name)
              .concat('|')
              .concat(selectedDataElementDimensionToDisplay.name)

          has_legend = "NO"
        }

        if (selectedRadioTypeLegend === "LEGEND") {
          id_string =
            "".concat(selectedProgramToDisplay.id)
              .concat('|')
              .concat(selectedProgramStageToDisplay.id)
              .concat('|')
              .concat(selectedDataElementDimensionToDisplay.id)
              .concat('|')
              .concat(legendToUse)
              .concat('|')
              .concat(selectedTypeLegendToDisplay)

          name_string =
            "".concat(selectedProgramToDisplay.name)
              .concat('|')
              .concat(selectedProgramStageToDisplay.name)
              .concat('|')
              .concat(selectedDataElementDimensionToDisplay.name)
              .concat('|')
              .concat(legendToUse && legends.find(l => l.id === legendToUse)?.name || '')
              .concat('|')
              .concat(selectedTypeLegendToDisplay)


          has_legend = "YES"
        }



        window.$(currentHtmlTagSelected).attr("id", id_string)
        window.$(currentHtmlTagSelected).attr("data-type", 'TRACKER')
        window.$(currentHtmlTagSelected).attr("data-has-legend", has_legend)
        window.$(currentHtmlTagSelected).attr("data-is", 'DATA_ELEMENT')
        window.$(currentHtmlTagSelected).html('')
        window.$(currentHtmlTagSelected).html(name_string)
      }

      if (selectedProgramToDisplay && selectedRadioDataToDisplay === ENROLLMENT && selectedEnrollmentDataToDisplay) {
        id_string = "".concat(selectedProgramToDisplay.id).concat('|').concat(selectedEnrollmentDataToDisplay)
        name_string = "".concat(selectedProgramToDisplay.name).concat('|').concat(selectedEnrollmentDataToDisplay)

        window.$(currentHtmlTagSelected).attr("id", id_string)
        window.$(currentHtmlTagSelected).attr("data-type", 'TRACKER')
        window.$(currentHtmlTagSelected).attr("data-has-legend", 'NO')
        window.$(currentHtmlTagSelected).attr("data-is", ENROLLMENT)
        window.$(currentHtmlTagSelected).html('')
        window.$(currentHtmlTagSelected).html(name_string)
      }


      cleanStateAfterInjectTrackerIds()
    }
  }


  const cleanStateAfterInjectTrackerIds = () => {
    setSelectedProgramToDisplay(null)
    setSelectedAttributeToDisplay(null)
    setSelectedDataElementDimensionToDisplay(null)
    setSelectedProgramStageToDisplay(null)
    setCurrentHtmlTagSelected(null)
    setSelectedOuLevelToDisplay(null)
    setSelectedTypeLegendToDisplay(null)
    setLegendToUse(null)
    setVisibleSelectDXTrackerModal(false)
    setSelectedAttributeIsSearchable(false)
    setSelectedAttributeValueTypeToDisplay(null)
    setSelectedEnrollmentDataToDisplay(null)
  }

  const getCorrectID = (dim) => {
    let id = dim?.id
    if (dim) {
      if (dim.type === PROGRAM_INDICATOR) {
        id = dim?.id?.split('.')?.length > 0 ? dim?.id?.split('.')?.[1] : dim.id
      }
    }

    return id

  }

  const handleInjectAggregateIds = () => {

    if (currentDimensionSelected) {
      let id_string = ""
      let name_string = ""
      let has_legend = 'NO'
      let has_organisation_unit_group = selectedOuGroupToDisplay ? 'YES' : 'NO'

      if (selectedOuLevelToDisplay && selectedRadioTypeLegend) {
        if (selectedRadioTypeLegend === 'VALUE') {
          id_string =
            ""
              .concat(getCorrectID(currentDimensionSelected))
              .concat('|')
              .concat(selectedOuLevelToDisplay)
              .concat(selectedOuGroupToDisplay ? '|'.concat(selectedOuGroupToDisplay) : '')

          name_string =
            ""
              .concat(currentDimensionSelected?.name)
              .concat('|')
              .concat(selectedOuLevelToDisplay === "CURRENT" ? "CURRENT" : organisationUnitLevels.find(lvl => lvl.id === selectedOuLevelToDisplay)?.name || selectedOuLevelToDisplay)
              .concat(selectedOuGroupToDisplay ? '|'.concat(organisationUnitGroups.find(o => o.id === selectedOuGroupToDisplay)?.name) : '')

          has_legend = 'NO'
        } else {
          id_string =
            ""
              .concat(getCorrectID(currentDimensionSelected))
              .concat('|')
              .concat(selectedOuLevelToDisplay)
              .concat('|')
              .concat(legendToUse)
              .concat('|')
              .concat(selectedTypeLegendToDisplay)
              .concat(selectedOuGroupToDisplay ? '|'.concat(selectedOuGroupToDisplay) : '')


          name_string =
            ""
              .concat(currentDimensionSelected.name)
              .concat('|')
              .concat(selectedOuLevelToDisplay === "CURRENT" ? "CURRENT" : organisationUnitLevels.find(lvl => lvl.id === selectedOuLevelToDisplay)?.name || selectedOuLevelToDisplay)
              .concat('|')
              .concat(legendToUse && legends.find(l => l.id === legendToUse)?.name || '')
              .concat('|')
              .concat(selectedTypeLegendToDisplay)
              .concat(selectedOuGroupToDisplay ? '|'.concat(organisationUnitGroups.find(o => o.id === selectedOuGroupToDisplay)?.name || selectedOuGroupToDisplay) : '')


          has_legend = 'YES'
        }

        window.$(currentHtmlTagSelected).attr("id", id_string)
        window.$(currentHtmlTagSelected).attr("data-type", 'AGGREGATE')
        window.$(currentHtmlTagSelected).attr("data-has-legend", has_legend)
        window.$(currentHtmlTagSelected).attr("data-has-organisationunitgroup", has_organisation_unit_group)
        window.$(currentHtmlTagSelected).html('')
        window.$(currentHtmlTagSelected).html(name_string)
        setVisibleSelectDXAggregateModal(false)
      }

      setCurrentDimensionSelected(null)
      setCurrentHtmlTagSelected(null)
      setSelectedOuLevelToDisplay(null)
      setSelectedOuGroupToDisplay(null)
      setSelectedTypeLegendToDisplay(null)
      setLegendToUse(null)
    }
  }


  const handleCloseSelectDXTitleModal = () => {
    setVisibleSelectDXTitle(false)
    setSelectedOuLevelToDisplay(null)
  }


  const handleCloseConfigurationModal = () => setVisibleConfigurationModal(false)


  const SaveModal = () => visibleSaveModal ? <Modal small onClose={handleCloseSaveModal}>
    <ModalTitle>
      Save Report
    </ModalTitle>
    <ModalContent>
      {!reportName && <NoticeBox title="Infos" warning>
        Give name to report
      </NoticeBox>}
      <Field label="Report name">
        <Input onChange={({ value }) => setReportName("".concat(value))} value={reportName} placeholder="report name" />
      </Field>

    </ModalContent>
    <ModalActions>
      <ButtonStrip end>
        <Button onClick={handleCloseSaveModal} secondary>
          close
        </Button>
        <Button onClick={handleSaveReport} primary disabled={loadingProcess} loading={loadingProcess}>
          Save Report
        </Button>
      </ButtonStrip>
    </ModalActions>
  </Modal> : <></>


  const getParentObjectList = () => {
    let newList = []

    newList.push(CURRENT_ORG_UNIT_OBJECT)

    if (organisationUnitLevels && organisationUnitLevels.length > 0) {
      for (let i = 1; i <= organisationUnitLevels.length - 1; i++) {
        newList.push({ name: 'Parent '.concat(i), value: 'PARENT_'.concat(i) })
      }
    }

    return newList
  }


  const getParentListFields = () => getParentObjectList().map(ou => (<SingleSelectOption label={ou.name} value={ou.value} />))

  const RenderOrganisationUnitName = () => {

  }


  const RenderDisplayWay = selectedProgramToDisplay && <div className='mt-2'>
    <Field label="Display Way">
      <Radio
        label="Value"
        small
        dense
        onChange={_ => setSelectedRadioTypeLegend("VALUE")}
        checked={selectedRadioTypeLegend === "VALUE" ? true : false}
      />

      <Radio
        label="Legend"
        small
        dense
        onChange={_ => setSelectedRadioTypeLegend("LEGEND")}
        checked={selectedRadioTypeLegend === "LEGEND" ? true : false}
      />
    </Field>
  </div>

  const RenderDataToUsed = selectedProgramToDisplay && <div className='mt-2'>
    <Field label="Data to used">
      <Radio
        label="Attributes"
        small
        dense
        onChange={_ => setSelectedRadioDataToDisplay(ATTRIBUTE)}
        checked={selectedRadioDataToDisplay === ATTRIBUTE ? true : false}
      />

      <Radio
        label="Datas from Enrollment"
        small
        dense
        onChange={_ => setSelectedRadioDataToDisplay(ENROLLMENT)}
        checked={selectedRadioDataToDisplay === ENROLLMENT ? true : false}
      />

      <Radio
        label="Data Element"
        small
        dense
        onChange={_ => setSelectedRadioDataToDisplay(DATA_ELEMENT)}
        checked={selectedRadioDataToDisplay === DATA_ELEMENT ? true : false}
      />

    </Field>
  </div>

  const handleChooseLegendToDisplay = selected => {
    setLegendToUse(selected)
    setSelectedTypeLegendToDisplay(null)
  }

  const RenderLegendToApply = selectedProgramToDisplay && <>
    {
      selectedRadioTypeLegend === "LEGEND" && (
        <>
          <div className='mt-2'>
            {
              loadingLegendContents && (
                <div className='d-flex'> <CircularLoader small /> <span className='ml-2'>Loading...</span></div>
              )
            }
            <Field label="Choose legend to apply ">
              <SingleSelect placeholder="Choose legend to apply" selected={legendToUse} onChange={({ selected }) => handleChooseLegendToDisplay(selected)} >
                {legends.length > 0 && legends.map(leg => (
                  <SingleSelectOption key={leg.id} label={leg.name} value={leg.id} />
                ))}
              </SingleSelect>
            </Field>
          </div>
        </>
      )
    }

    {selectedRadioTypeLegend === "LEGEND" && legendToUse && (
      <div className='mt-2'>
        <Field label="Choose legend to display">
          <SingleSelect placeholder="Choose legend to display" selected={selectedTypeLegendToDisplay} onChange={({ selected }) => setSelectedTypeLegendToDisplay(selected)} >
            <SingleSelectOption label="Color" value="color" />
            <SingleSelectOption label="Label" value="label" />
            <SingleSelectOption label="Image" value="image" />
            <SingleSelectOption label="Pie Chart" value="pie" />
          </SingleSelect>
        </Field>
      </div>
    )}
  </>


  const RenderAttributeContent = selectedProgramToDisplay && <div className='mt-2'>
    {selectedProgramToDisplay.programTrackedEntityAttributes?.length > 0 && (
      <Field label="Attribute">
        <SingleSelect
          placeholder="Attribute"
          selected={selectedAttributeToDisplay?.id}
          onChange={({ selected }) => {
            const attr_object = selectedProgramToDisplay.programTrackedEntityAttributes.map(pgAtt => pgAtt.trackedEntityAttribute).find(att => att.id === selected)
            if (attr_object) {
              setSelectedAttributeToDisplay(attr_object)
              setSelectedAttributeValueTypeToDisplay(attr_object.valueType)
            }
          }}
        >
          {selectedProgramToDisplay.programTrackedEntityAttributes
            .map(p => <SingleSelectOption key={p.id} value={p.trackedEntityAttribute?.id} label={p.trackedEntityAttribute?.name} />)
          }
        </SingleSelect>
      </Field>
    )}
  </div>


  const handleSelectedProgramStage = ({ selected }) => {
    setSelectedProgramStageToDisplay(selectedProgramToDisplay.programStages.find(p => p.id === selected))
    setSelectedDataElementDimensionToDisplay(null)
  }


  const RenderDataElementContent = selectedProgramToDisplay && <div className='mt-2'>
    <div>
      {selectedProgramToDisplay.programStages?.length > 0 && (
        <Field label="Program stage">
          <SingleSelect
            placeholder="Program stage"
            selected={selectedProgramStageToDisplay?.id}
            onChange={handleSelectedProgramStage} >
            {selectedProgramToDisplay.programStages.map(programStage => (
              <SingleSelectOption value={programStage.id} key={programStage.id} label={programStage.name} />
            ))}
          </SingleSelect>
        </Field>
      )}
    </div>

    {selectedProgramStageToDisplay && selectedProgramStageToDisplay.programStageDataElements?.length > 0 && (
      <div className='mt-2'>
        <Field label="Data Element">
          <SingleSelect
            placeholder="Data element"
            selected={selectedDataElementDimensionToDisplay?.id}
            onChange={({ selected }) => setSelectedDataElementDimensionToDisplay(selectedProgramStageToDisplay.programStageDataElements.map(stage => stage.dataElement).find(dataElement => dataElement.id === selected))}
          >
            {selectedProgramStageToDisplay.programStageDataElements.map(stage => <SingleSelectOption key={stage.dataElement.id} value={stage.dataElement?.id} label={stage.dataElement?.name} />)}
          </SingleSelect>
        </Field>
      </div>
    )}
  </div>


  const handleDisableOKBtnForTrackerInsersionFields = () => {
    return false
  }


  const RenderEnrollmentContent = () => (
    <div>
      <div className='mt-2'>
        <Field label="Which data ? ">
          <SingleSelect
            placeholder="Data"
            selected={selectedEnrollmentDataToDisplay}
            onChange={({ selected }) => setSelectedEnrollmentDataToDisplay(selected)}
          >
            <SingleSelectOption key={ORGANISATION_UNIT_NAME} value={ORGANISATION_UNIT_NAME} label="Organisation Unit name" />
            <SingleSelectOption key={ENROLLMENT_DATE} value={ENROLLMENT_DATE} label="Enrollment Date" />
            <SingleSelectOption key={INCIDENT_DATE} value={INCIDENT_DATE} label="Incident Date" />
          </SingleSelect>
        </Field>
      </div>
    </div>
  )

  const handleCloseOtherOrganisationUnitElementModal = () => {
    setVisibleOtherOrganisationUnitElementModal(false)
    setSelectedOtherOrganisationUnitElements([])
  }


  const handleInjectOtherOrganisationUnitElementToHTML = () => {
    if (selectedOtherOrganisationUnitElements.length > 0 && currentHtmlTagSelected) {

      const id_string = selectedOtherOrganisationUnitElements.join('|')

      const name_string = " ( ".concat(selectedOtherOrganisationUnitElements.join('-')).concat(" ) ")


      window.$(currentHtmlTagSelected).attr("id", id_string)
      window.$(currentHtmlTagSelected).attr("data-type", OTHER_ELEMENT)
      window.$(currentHtmlTagSelected).attr("data-is", ORGANISATION_UNIT_NAME)
      window.$(currentHtmlTagSelected).html('')
      window.$(currentHtmlTagSelected).html(name_string)

      setVisibleOtherOrganisationUnitElementModal(false)
      setSelectedOtherOrganisationUnitElements([])
    }
  }

  const RenderOtherOrganisationUnitElementModal = () => visibleOtherOrganisationUnitElementModal ? (
    <Modal onClose={handleCloseOtherOrganisationUnitElementModal} small>
      <ModalTitle>
        Organisation Unit name
      </ModalTitle>
      <ModalContent>
        <div className='border rounded p-3'>

          {
            getParentObjectList().map(o => (
              <div key={o.value}>
                <Checkbox
                  label={o.name}
                  value={o.value}
                  onChange={({ value }) => {
                    if (selectedOtherOrganisationUnitElements.includes(value)) {
                      setSelectedOtherOrganisationUnitElements(selectedOtherOrganisationUnitElements.filter(o => o !== value))
                    } else {
                      setSelectedOtherOrganisationUnitElements([...selectedOtherOrganisationUnitElements, value])
                    }
                  }}
                  checked={selectedOtherOrganisationUnitElements.includes(o.value) ? true : false}
                />
              </div>
            ))
          }

        </div>
      </ModalContent>
      <ModalActions>
        <ButtonStrip end>
          <Button onClick={handleCloseOtherOrganisationUnitElementModal}>
            close
          </Button>
          <Button
            primary
            // disabled={}
            onClick={() => handleInjectOtherOrganisationUnitElementToHTML()}
          >
            OK
          </Button>
        </ButtonStrip>
      </ModalActions>
    </Modal>
  ) : <></>




  const SelectDXTrackerModal = () => visibleSelectDXTrackerModal ? <Modal onClose={handleCloseSaveTrackerDimensionModal} small>
    <ModalTitle>
      Tracker Dimension
    </ModalTitle>
    <ModalContent>
      <div className='border rounded p-3'>
        {RenderDataToUsed}

        {selectedRadioDataToDisplay === ATTRIBUTE && (
          <>
            {RenderAttributeContent}
            {selectedAttributeToDisplay && RenderDisplayWay}
            {selectedAttributeToDisplay && RenderLegendToApply}
          </>
        )}

        {selectedRadioDataToDisplay === ENROLLMENT && (
          <>
            {RenderEnrollmentContent()}
          </>
        )}


        {selectedRadioDataToDisplay === DATA_ELEMENT && (
          <>
            {RenderDataElementContent}
            {selectedDataElementDimensionToDisplay && RenderDisplayWay}
            {selectedDataElementDimensionToDisplay && RenderLegendToApply}
          </>
        )}
      </div>
    </ModalContent>
    <ModalActions>
      <ButtonStrip end>
        <Button onClick={() => handleCloseSaveTrackerDimensionModal()}>
          close
        </Button>
        <Button
          primary
          disabled={handleDisableOKBtnForTrackerInsersionFields()}
          loading={loadingProcess ? true : false}
          onClick={() => handleInjectTrackerIds()}
        >
          OK
        </Button>
      </ButtonStrip>
    </ModalActions>
  </Modal> : <></>


  const handleChangeSelectedOuGroupToDisplay = ({ selected }) => setSelectedOuGroupToDisplay(selected)

  const SelectDXAggregateModal = () => visibleSelectDXAggregateModal ? <Modal onClose={handleCloseSaveAggregateDimensionModal} small>
    <ModalTitle>
      Aggregate Dimension
    </ModalTitle>
    <ModalContent>
      <div className='border rounded p-3'>
        <div >
          <Field label="Select organisation unit level to display">
            <SingleSelect placeholder="Organisation Unit" selected={selectedOuLevelToDisplay} onChange={({ selected }) => setSelectedOuLevelToDisplay(selected)} >
              {getParentListFields()}
            </SingleSelect>
          </Field>
        </div>

        {
          selectedOuLevelToDisplay &&
          organisationUnitGroups.length > 0 &&
          (
            <div className='mt-2'>
              <Field label="Select organisation unit group ( optional ) ">
                <SingleSelect placeholder="Organisation Unit group" selected={selectedOuGroupToDisplay} onChange={handleChangeSelectedOuGroupToDisplay} >
                  {
                    organisationUnitGroups.map(ouG => (
                      <SingleSelectOption key={ouG.id} value={ouG.id} label={ouG.name} />
                    ))
                  }
                </SingleSelect>
              </Field>
            </div>
          )
        }

        <div className='mt-2'>
          <Field label="Display Way">
            <Radio
              label="Value"
              small
              dense
              onChange={_ => setSelectedRadioTypeLegend("VALUE")}
              checked={selectedRadioTypeLegend === "VALUE" ? true : false}
            />

            <Radio
              label="Legend"
              small
              dense
              onChange={_ => setSelectedRadioTypeLegend("LEGEND")}
              checked={selectedRadioTypeLegend === "LEGEND" ? true : false}
            />

          </Field>
        </div>

        {selectedRadioTypeLegend === "LEGEND" && (
          <>
            <div className='mt-2'>
              {
                loadingLegendContents && (
                  <div className='d-flex'> <CircularLoader small /> <span className='ml-2'>Loading...</span></div>
                )
              }
              <Field label="Choose legend to apply ">
                <SingleSelect placeholder="Choose legend to apply" selected={legendToUse} onChange={({ selected }) => setLegendToUse(selected)} >
                  {legends.length > 0 && legends.map(leg => (
                    <SingleSelectOption key={leg.id} label={leg.name} value={leg.id} />
                  ))}
                </SingleSelect>
              </Field>
            </div>

            {legendToUse && (
              <div className='mt-2'>
                <Field label="Choose legend to display">
                  <SingleSelect placeholder="Choose legend to display" selected={selectedTypeLegendToDisplay} onChange={({ selected }) => setSelectedTypeLegendToDisplay(selected)} >
                    <SingleSelectOption label="Color" value="color" />
                    <SingleSelectOption label="Label" value="label" />
                    <SingleSelectOption label="Image" value="image" />
                    <SingleSelectOption label="Pie Chart" value="pie" />
                  </SingleSelect>
                </Field>
              </div>
            )}
          </>
        )}
      </div>
    </ModalContent>
    <ModalActions>
      <ButtonStrip end>
        <Button onClick={() => handleCloseSaveAggregateDimensionModal()}>
          close
        </Button>
        <Button primary disabled={
          selectedOuLevelToDisplay &&
            selectedRadioTypeLegend ?
            selectedRadioTypeLegend === "VALUE" ? false :
              selectedTypeLegendToDisplay ? false : true
            : true
        }
          loading={loadingProcess ? true : false}
          onClick={() => handleInjectAggregateIds()}
        >
          OK
        </Button>
      </ButtonStrip>
    </ModalActions>
  </Modal> : <></>


  const SelectDXTitleModal = () => visibleSelectDXTitle ? <Modal onClose={() => handleCloseSelectDXTitleModal()} small>
    <ModalTitle>
      Dimension Title
    </ModalTitle>
    <ModalContent>
      <div className='border rounded p-3'>
        <div>
          <Field label="Select organisation unit level to display">
            <SingleSelect placeholder="Organisation Unit" selected={selectedOuLevelToDisplay} onChange={({ selected }) => setSelectedOuLevelToDisplay(selected)} >
              {getParentListFields()}
            </SingleSelect>
          </Field>
        </div>
      </div>
    </ModalContent>
    <ModalActions>
      <ButtonStrip end>
        <Button onClick={() => handleCloseSelectDXTitleModal()}>
          close
        </Button>
        <Button primary
          loading={loadingProcess ? true : false}
          onClick={() => handleInjectTrackerIds()}
        >
          OK
        </Button>
      </ButtonStrip>
    </ModalActions>
  </Modal> : <></>

  const RenderTrackerContifigurationDimensionContent = () => <TrackerDimensionsDialog
    selectedPrograms={selectedTrackerConfigDimensionsPrograms}
    setSelectedPrograms={setSelectedTrackerConfigDimensionsPrograms}
  />

  const RenderAggregateContifigurationDimensionContent = () => <DataDimension
    selectedDimensions={selectedConfigDimensionsAggregate}
    onSelect={value => {
      setSelectedConfigDimensionsAggregate(value.items)
    }}
    displayNameProp="displayName"
  />

  const ConfigurationModal = () => visibleConfigurationModal ? <Modal onClose={() => handleCloseConfigurationModal()} large>
    <ModalTitle>
      Configuration
    </ModalTitle>
    <ModalContent>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div className='my-2'>
          <Segmented options={[
            { label: AGGREGATE.name, value: AGGREGATE.value },
            { label: TRACKER.name, value: TRACKER.value },
          ]}
            value={selectedDimensionContentToDisplay}
            onChange={value => setSelectedDimensionContentToDisplay(value)}
          />
        </div>

        {selectedDimensionContentToDisplay === TRACKER.value && RenderTrackerContifigurationDimensionContent()}
        {selectedDimensionContentToDisplay === AGGREGATE.value && RenderAggregateContifigurationDimensionContent()}

        {checkedKeys?.checked.length > 0 && tabPage === "OU" &&
          (
            <div style={{ position: "absolute", bottom: 10, right: 10, padding: "5px 10px", borderRadius: "5px", background: "#eee" }}>
              {"" + checkedKeys.checked.length + " Organisation units selected "}
            </div>
          )
        }
      </div>
    </ModalContent>
    <ModalActions>
      <ButtonStrip end>
        <Button onClick={() => handleCloseConfigurationModal()} icon={<CgCloseO style={{ fontSize: "16px" }} />}>
          close
        </Button>
      </ButtonStrip>
    </ModalActions>
  </Modal> : <></>



  const handleCancelEditReport = () => {
    setCurrentReport(null)
    setCurrentReportContent(null)
    setEditReport(false)
    setVisibleAddReport(false)
    cleanStateAfterReportSaved()
  }



  const handleClickOnProgramDimension = (currentProg) => {
    if (currentHtmlTagSelected) {
      setVisibleSelectDXTrackerModal(true)
      setSelectedProgramToDisplay(currentProg)
    }
  }

  const RenderTrackerDataElementCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#trackerDimensionsProgramCollapse"
            aria-expanded="false"
          >Programs</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedTrackerConfigDimensionsPrograms.length + " )"} </span>
        </div>
        <div className='collapse' id="trackerDimensionsProgramCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100", height: "200px", overflowX: "hidden" }}>
              {selectedTrackerConfigDimensionsPrograms.length === 0 && <div> No program selected !  </div>}
              {selectedTrackerConfigDimensionsPrograms.length > 0 && <div>
                {selectedTrackerConfigDimensionsPrograms
                  .filter(dim =>
                    searchInAllInput && searchInAllInput?.trim()?.length > 0 ? dim.name?.toLowerCase()?.includes(searchInAllInput?.toLowerCase()) :
                      true
                  )
                  .map(prog => <div style={{ fontSize: "14px" }} className='my-dx' key={prog.id} onClick={() => handleClickOnProgramDimension(prog)}>{prog.name} </div>)}
              </div>
              }
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderDataSetEventCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#dataSetEventCollapse"
            aria-expanded="false"
          >Data set event</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET_EVENT).length + " )"} </span>
        </div>
        <div className='collapse' id="dataSetEventCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET_EVENT).length === 0 && <div> No Data set event  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET_EVENT).length > 0 && <div>
                {selectedConfigDimensionsAggregate
                  .filter(dim => dim.type === DATA_SET_EVENT ? searchInAllInput && searchInAllInput.trim()?.length > 0 ? dim?.name?.toLowerCase()?.includes(searchInAllInput?.toLowerCase()) : true : false)
                  .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
              </div>}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderIndicatorCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#indicatorCollapse"
            aria-expanded="false"
          >Indicators</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === INDICATOR).length + " )"} </span>

        </div>
        <div className='collapse' id="indicatorCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === INDICATOR).length === 0 && <div> No Indicators  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === INDICATOR).length > 0 && <div>
                {selectedConfigDimensionsAggregate
                  .filter(dim => dim.type === INDICATOR ? searchInAllInput && searchInAllInput.trim().length > 0 ? dim.name.toLowerCase().includes(searchInAllInput.toLowerCase()) : true : false)
                  .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
              </div>}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderCategoryComboCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#categoryOptionComboCollapse"
            aria-expanded="false"
          >Category option combo</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === CATEGORY_COMBO).length + " )"} </span>
        </div>
        <div className='collapse' id="categoryOptionComboCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === CATEGORY_COMBO).length === 0 && <div> No Category option combo  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === CATEGORY_COMBO).length > 0 && <div>
                {selectedConfigDimensionsAggregate
                  .filter(dim => dim.type === CATEGORY_COMBO ? searchInAllInput && searchInAllInput.trim().length > 0 ? dim.name.toLowerCase().includes(searchInAllInput.toLowerCase()) : true : false)
                  .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
              </div>}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderDataElementCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#dataElementCollapse"
            aria-expanded="false"
          >Data Element</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_ELEMENT).length + " )"} </span>
        </div>
        <div className='collapse' id="dataElementCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_ELEMENT).length === 0 && <div> No Data Element  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_ELEMENT).length > 0 && (
                <div>
                  {selectedConfigDimensionsAggregate
                    .filter(dim => dim.type === DATA_ELEMENT ?
                      searchInAllInput && searchInAllInput.trim().length > 0
                        ? dim.name.toLowerCase().includes(searchInAllInput.toLowerCase()) : true : false)
                    .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
                </div>
              )}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderDataSetCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#dataSetCollapse"
            aria-expanded="false"
          >Data Set</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET).length + " )"} </span>
        </div>
        <div className='collapse' id="dataSetCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET).length === 0 && <div> No Data Set  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === DATA_SET).length > 0 && <div>
                {selectedConfigDimensionsAggregate
                  .filter(dim => dim.type === DATA_SET ? searchInAllInput && searchInAllInput.trim().length > 0 ? dim.name.toLowerCase().includes(searchInAllInput.toLowerCase()) : true : false)
                  .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
              </div>}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderProgramIndicatorCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#programIndicatorCollapse"
            aria-expanded="false"
          >Program Indicators</a>
          <span style={{ fontSize: "12px" }}>{" ( " + selectedConfigDimensionsAggregate.filter(dim => dim.type === PROGRAM_INDICATOR).length + " )"} </span>
        </div>
        <div className='collapse' id="programIndicatorCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === PROGRAM_INDICATOR).length === 0 && <div> No Program Indicators  </div>}
              {selectedConfigDimensionsAggregate.filter(dim => dim.type === PROGRAM_INDICATOR).length > 0 && <div>
                {selectedConfigDimensionsAggregate
                  .filter(dim => dim.type === PROGRAM_INDICATOR ? searchInAllInput && searchInAllInput.trim().length > 0 ? dim.name.toLowerCase().includes(searchInAllInput.toLowerCase()) : true : false)
                  .map(dimension => <div style={{ fontSize: "14px" }} className='my-dx' key={dimension.id} onClick={() => handleClickOnAggregateDimensionElement(dimension)}>{dimension?.name} </div>)}
              </div>}
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const handleClickOtherElementDate = () => {
    if (currentHtmlTagSelected && currentHtmlTagSelected !== "") {

      let id_string = ""
      let name_string = ""

      if (currentHtmlTagSelected) {

        id_string = SELECTED_DATE
        name_string = "Date"

        window.$(currentHtmlTagSelected).attr("id", id_string)
        window.$(currentHtmlTagSelected).attr('data-is', SELECTED_DATE)
        window.$(currentHtmlTagSelected).attr("data-type", OTHER_ELEMENT)
        window.$(currentHtmlTagSelected).html(name_string)
      }

      setCurrentHtmlTagSelected(null)
    }

  }

  const handleClickOtherOrganisationUnitName = () => {
    if (currentHtmlTagSelected && currentHtmlTagSelected !== "") {
      setVisibleOtherOrganisationUnitElementModal(true)
    }
  }

  const RenderRenderOtherCollapse = () => (
    <div className='mt-2'>
      <div className='card bg-white rounded border my-shadow '>
        <div className='card-header py-1 bg-white'>
          <a
            data-toggle="collapse"
            style={{ color: "#000" }}
            data-target="#OthersElementCollapse"
            aria-expanded="false"
          >Others Elements</a>
        </div>
        <div className='collapse' id="OthersElementCollapse">
          <div className='card-body'>
            <Scrollbars style={{ width: "100%", height: "200px", overflowX: "hidden" }}>
              <div style={{ fontSize: "14px" }} className="my-dx" onClick={handleClickOtherOrganisationUnitName} > Organisation unit name </div>
              <div style={{ fontSize: "14px" }} className="my-dx" onClick={handleClickOtherElementDate}> Date </div>
            </Scrollbars>
          </div>
        </div>
      </div>
    </div>
  )

  const RenderTrackerDimensionContent = () => (
    <div style={{ maxHeight: "100vh" }}>
      <Scrollbars style={{ width: "100%", height: "90vh" }}>
        {RenderTrackerDataElementCollapse()}
      </Scrollbars>
    </div>

  )

  const RenderAggregateDimensionContent = () => (
    <div style={{ maxHeight: "100vh" }}>
      <Scrollbars style={{ width: "100%", height: "80vh" }}>
        {RenderDataElementCollapse()}
        {RenderCategoryComboCollapse()}
        {RenderIndicatorCollapse()}
        {RenderDataSetCollapse()}
        {RenderDataSetEventCollapse()}
        {RenderProgramIndicatorCollapse()}
        {RenderRenderOtherCollapse()}
      </Scrollbars>
    </div>
  )

  const RenderAddReport = () => loadingInitState ? (
    <div style={{ width: "100%", height: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}> <CircularLoader>Loading</CircularLoader> </div>
  ) : (
    <div style={{ width: "100%" }}>
      <div className='my-shadow p-3 bg-white' style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
        {editReport && currentRepport ? <div style={{ fontSize: '16px', fontWeight: 'bold', }}> {currentRepport.name} </div> : <div style={{ fontWeight: 'bold', fontSize: '16px' }}> Design Interface</div>}
      </div>

      <div className='row py-4 px-3' >
        {editReport && currentRepport && !currentRepportContent && <NoticeBox warning>{`${currentRepport?.name} Content not found !`}</NoticeBox>}
        <div className='col-md-9'>
          <div className="my-1">
            <Button onClick={() => setVisibleConfigurationModal(true)} primary icon={<IoSettingsOutline style={{ color: '#fff' }} />}>Configuration</Button>
          </div>
          <div id="summernote"></div>
          <div className='my-1 d-flex'>
            <Button destructive onClick={handleCancelEditReport}>
              Close
            </Button>
            <div className='ml-2'>
              <Button primary onClick={() => setVisibleSaveModal(true)}>  {currentRepport && editReport ? "Update Report" : "Save Report"} </Button>
            </div>
          </div>
        </div>
        <div className='col-md-3'>
          <div style={{ position: "sticky", top: 30 }}>
            <div style={{ display: "flex", alignItems: 'center' }}>
              <Segmented options={[
                { label: AGGREGATE.name, value: AGGREGATE.value },
                { label: TRACKER.name, value: TRACKER.value },
              ]}
                value={selectedDimensionContentToDisplay}
                onChange={value => setSelectedDimensionContentToDisplay(value)}
              />
              <div style={{ marginLeft: "10px" }}>
                <Button dense icon={<AiOutlineSearch style={{ color: "#fff", fontSize: "18px" }} />} primary onClick={() => setSearchMode(true)}>Search</Button>
              </div>
            </div>
            {isSearchMode && (
              <div style={{ margin: "20px 0px", }}>
                <div>Search in all elements</div>
                <div style={{ display: 'flex', alignItems: "center", marginTop: '5px' }}>
                  <Input onChange={({ value }) => setSearchInAllInput("".concat(value))} value={searchInAllInput} placeholder="Filter in all elements" />
                  <Button icon={<AiFillCloseCircle style={{ color: "#fff", fontSize: "18px" }} />} style={{ background: 'red', color: '#fff', marginLeft: '10px' }} onClick={() => setSearchMode(false)} >
                    Close
                  </Button>
                </div>
              </div>
            )}
            {selectedDimensionContentToDisplay === AGGREGATE.value && RenderAggregateDimensionContent()}
            {selectedDimensionContentToDisplay === TRACKER.value && RenderTrackerDimensionContent()}
          </div>
        </div>
      </div>
    </div>
  )

  const handleDeleteReport = async (id) => {
    try {
      if (id) {
        setLoadingProcess(false)
        setActiveElementID(id)
       
        const refreshReportList = await loadDataStore(process.env.REACT_APP_REPORTS_KEY, null, null, [])
        const newPayload = refreshReportList.filter(r => r.id !== id)

        await saveDataToDataStore(process.env.REACT_APP_REPORTS_KEY, newPayload, setLoadingProcess, null, null)
        await deleteKeyFromDataStore(`REPORT_${id}`)
        loadDataStore(process.env.REACT_APP_REPORTS_KEY, setLoadingReports, setReports, [])

        setNotif({ show: true, message: 'Delete success !', type: NOTIFICATON_SUCCESS })
        setLoadingProcess(false)
        setActiveElementID(null)
      } else {
        throw new Error("No report selected ")
      }

    } catch (err) {
      setLoadingProcess(false)
      setActiveElementID(null)
      setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
    }
  }

  const handleEditReport = async (report) => {
    try {
      setVisibleAddReport(true)
      setEditReport(true)
      const content = await loadDataStore(`REPORT_${report.id}`, setLoadingInitState, null, {})
      if (!content)
        throw new Error(report.name + " Content not found !")

      initState(report, content)
    } catch (err) {
      setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
    }
  }

  const handleAddReport = () => {
    setVisibleAddReport(true)
    initSummernote()
  }

  const RenderListReport = () => (
    <>
      <div className='p-3 bg-white' style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}> Report List</div>
      </div>

      <div className="p-3">
        <div className='bg-white p-2 rounded my-shadow'>
          <div className='text-right'>
            <Button primary onClick={handleAddReport}>New Report</Button>
          </div>
          <div className="mt-1">
            {
              loadingReports && (
                <div className='d-flex'> <CircularLoader small /> <span className='ml-2'>Loading...</span></div>
              )
            }
            <div className='mt-2'>
              <Table className="border">
                <TableHead>
                  <TableRowHead className="background-green-40">
                    <TableCellHead dense>Name</TableCellHead>
                    <TableCellHead dense>Last updated</TableCellHead>
                    <TableCellHead dense>Actions</TableCellHead>
                  </TableRowHead>
                </TableHead>
                <TableBody>
                  {
                    reports.length > 0 ? reports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell dense>
                          {report.name}
                        </TableCell>
                        <TableCell dense>
                          {
                            report.updatedAt && (
                              <div className='text-muted'> {dayjs(report.updatedAt).format('DD/MM/YYYY')} </div>
                            )
                          }

                        </TableCell>
                        <TableCell dense>
                          <div className='d-flex align-items-center'>
                            <span className='d-flex align-items-center justify-content-center'>
                              <BiEdit style={{ color: "#06695C", fontSize: "18px", cursor: "pointer", background: "#eeeeee20", padding: "2px", borderRadius: "5px", border: "1px solid #ccc" }} onClick={() => handleEditReport(report)} />
                            </span>
                            <span className='ml-2 d-flex align-items-center justify-content-center'>
                              {loadingProcess && activeElementID === report.id && <CircularLoader small className='mr-2' />}
                              <Popconfirm
                                title="Delete Report"
                                description="Are you sure to delete this report ?"
                                onConfirm={() => handleDeleteReport(report.id)}
                                icon={
                                  <QuestionCircleOutlined
                                    style={{
                                      color: 'red',
                                    }}
                                  />
                                }
                              >
                                <RiDeleteBinLine style={{ color: "red", fontSize: "18px", cursor: "pointer", background: "#eeeeee20", padding: "2px", borderRadius: "5px", border: "1px solid #ccc" }} />
                              </Popconfirm>
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell dense colSpan="6"> No Report </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>

          </div>
        </div>
      </div>
    </>
  )


  return (
    <>
      <div>
        {visibleAddReport && RenderAddReport()}
        {!visibleAddReport && RenderListReport()}

        {SaveModal()}
        {RenderOtherOrganisationUnitElementModal()}
        {SelectDXTitleModal()}
        {SelectDXTrackerModal()}
        {SelectDXAggregateModal()}
        {ConfigurationModal()}
      </div>
    </>
  )

}

export default DesignsPage