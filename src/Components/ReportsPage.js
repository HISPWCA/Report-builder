import React, { useState, useEffect } from 'react'
import {
    Button,
    NoticeBox,
    Input,
    Field,
    SingleSelect,
    SingleSelectOption,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
} from '@dhis2/ui'

import { TbReport } from 'react-icons/tb'
import { SMS_ROUTE_API } from '../api.routes'
import { AGGREGATE, IMAGE, NOTIFICATON_CRITICAL, NOTIFICATON_SUCCESS, OTHER_ELEMENT, STUDENT_IMAGE, TRACKER } from '../utils/constants'

const ReportsPage = ({
    selectedReport,
    setSearchProperties,
    searchProperties,
    searchByAttribute,
    queryTeiList,
    selectedTEI,
    currentOrgUnits,
    setNotif,
    smsConfigs

}) => {


    const [loadingTeiProcess, setLoadingTeiProcess] = useState(false)
    const [loadingSendSMS, setLoadingSendSMS] = useState(false)

    const [visibleSendSMSModal, setVisibleSendSMSModal] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null)

    const printReportAsPDF = () => {
        let reportDocument = document.querySelector('[id="my-table-container"]')

        const win = window.open('', '', 'height=1000,width=700')


        reportDocument.querySelectorAll('canvas').forEach(cv => {
            const current_canvas_parent = cv.parentElement
            const current_canvas_url = cv.toDataURL()

            current_canvas_parent.innerHTML = "<img src='" + current_canvas_url + "' />"
        })

        win.document.write(`<!DOCTYPE html><head></head>`)
        win.document.write(`<body lang="en">`)
        win.document.write(reportDocument.innerHTML)
        // write report here 
        win.document.write(`</body></html>`)

        win.document.close()
        win.print()
    }



    const handleSearchInput = (value, index) => {
        const newProperties = searchProperties.map((el, i) => {
            if (i === index) {
                return { ...el, value: value }
            } else {
                return el
            }
        })
        setSearchProperties(newProperties)
    }


    const convertHML_element_to_plain_text = (html) => {
        const text_content = ""

        return text_content
    }


    const handleSendSMS = async () => {
        try {
            setLoadingSendSMS(true)
            if (!selectedTEI)
                throw new Error("Please Select tei")

            if (!selectedTemplate)
                throw new Error("Please select SMS template you want to apply")

            let parser = new DOMParser()
            const HTML_TEMPLATE = selectedTemplate.code


            if (!HTML_TEMPLATE)
                throw new Error("No html template found ")

            let HTML_TEMPLATE_DOM = parser.parseFromString(HTML_TEMPLATE, 'text/html')

            const all_elements = HTML_TEMPLATE_DOM.querySelectorAll("[id*='SMS'")

            for (let at of all_elements) {
                const id = at.getAttribute("id")?.split('-')
                const programID = id[1]
                const attributeID = id[2]
                const getAttributeTEI = selectedTEI.attributes?.find(tei => tei.attribute === attributeID)

                if (getAttributeTEI && selectedTEI.enrollments?.[0]?.program === programID) {
                    const founded_el = HTML_TEMPLATE_DOM.querySelector("[id='" + at.getAttribute('id') + "']")
                    if (founded_el) {
                        founded_el.innerHTML = getAttributeTEI.value
                    }
                }
            }


            let TEMPLATE_PLAIN_TEXT = HTML_TEMPLATE_DOM.body.textContent

            if (!TEMPLATE_PLAIN_TEXT)
                throw new Error("No SMS Template")

            TEMPLATE_PLAIN_TEXT = TEMPLATE_PLAIN_TEXT.replaceAll('\n', ' ')?.replaceAll(':', ' ')?.replaceAll(';', ' ')

            const payload = {
                message: TEMPLATE_PLAIN_TEXT,
                recipients: [selectedTEI.attributes.find(at => at.attribute === "YnHuqCmuydE")?.value]
            }


            const request = await fetch(SMS_ROUTE_API, {
                method: "post",
                body: JSON.stringify(payload),
                headers: {
                    "content-type": "application/json"
                }
            })

            const response = await request.json()

            if (response.status === "ERROR")
                throw response

            setNotif({ show: true, message: 'SMS Sended !', type: NOTIFICATON_SUCCESS })
            setLoadingSendSMS(false)
            setSelectedTemplate(null)
            setVisibleSendSMSModal(false)
        } catch (err) {
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
            setLoadingSendSMS(false)
        }
    }


    const SendSMSModal = () => visibleSendSMSModal ? (
        <Modal small onClose={() => setVisibleSendSMSModal(false)}>
            <ModalTitle>
                SMS
            </ModalTitle>
            <ModalContent>

                {
                    smsConfigs?.length > 0 ? (
                        <Field label="SMS Template ">
                            <SingleSelect placeholder="Select template " selected={selectedTemplate?.id} onChange={({ selected }) => setSelectedTemplate(smsConfigs?.find(conf => conf.id === selected))} >
                                {smsConfigs.map(template => (<SingleSelectOption key={template.id} value={template.id} label={template.name} />))}
                            </SingleSelect>
                        </Field>

                    ) : <div className='my-3'>

                        <NoticeBox error title="SMS Template configuration">
                            No SMS Template configuration founded ! please make sur you have create one SMS Template
                        </NoticeBox>
                    </div>
                }

            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={() => setVisibleSendSMSModal(false)} secondary>
                        close
                    </Button>
                    <Button onClick={handleSendSMS} primary disabled={loadingSendSMS || !selectedTemplate ? true : false} loading={loadingSendSMS ? true : false}>
                        Send SMS
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    ) : (<></>)


    useEffect(() => {
        if (selectedReport) {

            const aggregateElement = document.body.querySelectorAll("[data-type=" + AGGREGATE.value + "]")
            const trackerElements = document.body.querySelectorAll("[data-type=" + TRACKER.value + "]")
            const otherElements = document.body.querySelectorAll("[data-type=" + OTHER_ELEMENT + "]")

            if (trackerElements && trackerElements.length > 0) {
                trackerElements.forEach(el => {
                    const dataAttributeValueType = el.getAttribute('data-attribute-value-type')
                    if (dataAttributeValueType && dataAttributeValueType === IMAGE) {
                        el.innerHTML = `<img style={{ width: "200px", height: "200px" }} src="${STUDENT_IMAGE}" />`
                    } else {
                        el.innerHTML = ""
                    }
                })
            }

            if (aggregateElement && aggregateElement.length > 0) {
                aggregateElement.forEach(el => {
                    el.innerHTML = ""
                })
            }

            if (otherElements && otherElements.length > 0) {
                otherElements.forEach(el => {
                    el.innerHTML = ""
                })
            }

        }
    }, [selectedReport])


    return (
        <div>
            <div className="bg-white py-2 d-flex align-items-center justify-content-center my-shadow" style={{ position: 'sticky', top: '0px', zIndex: 100 }}>
                <div className="mr-2">
                    <TbReport style={{ fontSize: "50px", color: "#06695C" }} />
                </div>
                <div style={{ fontSize: "24px" }} className='font-weight-bold'>Report Builder</div>
            </div>
            <div style={{ padding: '10px' }}>
                {
                    selectedReport && searchProperties && searchByAttribute && (
                        <div className='d-flex align-items-center justify-content-center mt-2'>
                            <div>Search by properties : </div>
                            {searchProperties.map((p, index) => (
                                <Input className="ml-2" placeholder={p.trackedEntityAttribute?.name} value={p.value} onChange={({ value }) => handleSearchInput(value, index)} />
                            ))}
                            <Button className="ml-2" loading={loadingTeiProcess} disabled={currentOrgUnits.length > 0 ? false : true} onClick={() => queryTeiList()}>Search</Button>
                        </div>
                    )
                }

                {
                    selectedReport && <div className='mt-2 d-flex justify-content-center align-items-center'>
                        <Button primary onClick={printReportAsPDF}>Print report</Button>
                        {selectedTEI && <Button className="ml-2" loading={loadingSendSMS} onClick={() => setVisibleSendSMSModal(true)}>Send SMS</Button>}
                    </div>
                }

                {
                    selectedReport ? (
                        <div style={{ margin: '0px auto' }}>
                            <div className='mt-1' id="my-table-container" style={{ fontSize: "12px", maxWidth: "900px", margin: "0px auto" }} dangerouslySetInnerHTML={{ __html: selectedReport.html || "" }} />
                        </div>
                    ) : (
                        <div className='mt-2'>
                            <NoticeBox title="Report" warning>
                                No report selected !
                            </NoticeBox>
                        </div>
                    )
                }
                {SendSMSModal()}
            </div>
        </div>
    )
}

export default ReportsPage