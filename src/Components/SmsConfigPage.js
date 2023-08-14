import { Button, ButtonStrip, Field, Input, Modal, ModalActions, ModalContent, ModalTitle, SingleSelect, SingleSelectOption, Table, TableBody, TableCell, TableCellHead, TableHead, TableRow, TableRowHead } from "@dhis2/ui"
import { useEffect, useState } from 'react'
import { PROGRAMS_ROUTE } from "../api.routes";
import { v4 as uuid } from 'uuid'
import { BiEdit } from 'react-icons/bi'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Spin } from "antd";
import { loadDataStore, saveDataToDataStore } from "../utils/fonctions";
import { NOTIFICATON_CRITICAL, NOTIFICATON_SUCCESS } from "../utils/constants";

const summernoteConfig = {
    height: 200,
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

const SmsConfigPage = ({
    loadingSmsConfigs,
    setLoadingSmsConfigs,
    smsConfigs,
    setSmsConfigs
}) => {
    const [currentHtmlTagSelected, setCurrentHtmlTagSelected] = useState(null)
    const [loadingPrograms, setLoadingPrograms] = useState(false)
    const [programs, setPrograms] = useState([])
    const [templateName, setTemplateName] = useState('')

    const [visibleAddAttributeModal, setVisibleAddAttributeModal] = useState(false)
    const [visibleSaveModal, setVisibleSaveModal] = useState(false)


    const [isCreateMode, setCreateMode] = useState(false)
    const [currentSMSTemplate, setCurrentSMSTemplate] = useState(null)
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(null)

    const [selectedAttribute, setSelectedAttribute] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState(null)

    const [loadingProcess, setLoadingProcess] = useState(false)

    const initSummernote = () => {
        window.$(document).ready(function () {
            // if (existing_html) {
            //     $('#summernote').html(existing_html)
            // }
            window.$('#summernote-sms-template').summernote({
                ...summernoteConfig,
                callbacks: {
                    onInit: function (event) {
                        $(".note-editable").on('click', function (e) {
                            setCurrentHtmlTagSelected(e.target)
                        })
                    }
                }
            })

        })
    }

    const loadPrograms = async _ => {
        try {
            setLoadingPrograms(true)
            const request = await fetch(PROGRAMS_ROUTE
                .concat('?fields=id,name,programTrackedEntityAttributes[id,name, program[id,name], trackedEntityAttribute[id,name,display,valueType]]')
                .concat(',programType, displayShortName, programIndicators[id,name]')
                .concat(',programStages[id,name,programStageDataElements[id,dataElement[id,name] ] ]&filter=programType:eq:WITH_REGISTRATION')
            )
            const response = await request.json()
            if (response.status === "ERROR")
                throw response

            const programs = response.programs.map(p => ({ ...p, programTrackedEntityAttributes: p.programTrackedEntityAttributes.map(at => ({ ...at, programType: p.programType, program: p.id })) }))
            setLoadingPrograms(false)
            setPrograms(programs)
        } catch (err) {
            setLoadingPrograms(false)
        }
    }

    const handleSaveReport = () => {
        if (selectedProgram && selectedAttribute && currentHtmlTagSelected) {

            const ID_string = "SMS-".concat(selectedProgram.id).concat("-").concat(selectedAttribute.id)
            const NAME_String = "( ".concat(selectedProgram.name).concat(' - ').concat(selectedAttribute.name).concat(' )')

            currentHtmlTagSelected.setAttribute("id", ID_string)
            currentHtmlTagSelected.innerHTML = NAME_String
        }
        setVisibleAddAttributeModal(false)

    }

    const handleCloseSaveModal = () => {
        setVisibleAddAttributeModal(false)
        setSelectedAttribute(null)
        setSelectedProgram(null)
        setCurrentHtmlTagSelected(null)
    }
    const AttributeModal = () => visibleAddAttributeModal ? (
        <Modal small onClose={handleCloseSaveModal}>
            <ModalTitle>
                Attribute
            </ModalTitle>
            <ModalContent>
                <div className="mt-1">
                    <Field label="Select program ">
                        <SingleSelect placeholder="Program " selected={selectedProgram?.id} onChange={({ selected }) => setSelectedProgram(programs.find(p => p.id === selected))} >
                            {programs.map(program => (<SingleSelectOption key={program.id} value={program.id} label={program.name} />))}
                        </SingleSelect>
                    </Field>
                </div>

                {
                    selectedProgram?.programTrackedEntityAttributes?.length > 0 && <div className="mt-2">
                        <Field label="Select Attribute ">
                            <SingleSelect placeholder="program attribute " selected={selectedAttribute?.id} onChange={({ selected }) => setSelectedAttribute(selectedProgram.programTrackedEntityAttributes.map(p => p.trackedEntityAttribute)?.find(at => at.id === selected))} >
                                {selectedProgram.programTrackedEntityAttributes.map(p => (
                                    <SingleSelectOption value={p.trackedEntityAttribute?.id} key={p.trackedEntityAttribute?.id} label={p.trackedEntityAttribute?.name} />
                                ))}
                            </SingleSelect>
                        </Field>
                    </div>
                }

            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={handleCloseSaveModal} secondary>
                        Cancel
                    </Button>
                    <Button onClick={() => handleSaveReport()} primary>
                        Add
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    ) : <></>

    const handleAddAttribute = () => {
        setVisibleAddAttributeModal(true)
    }


    const handleSaveTemplate = async () => {
        try {
            setLoadingProcess(true)
            const html_code = window.$('#summernote-sms-template')?.summernote('code')
            if (!html_code || html_code.trim() === "")
                throw new Error("Html must not empty")

            if (!templateName || templateName.trim() === "")
                throw new Error("Template name is required")

            const payload = smsConfigs && smsConfigs.length > 0 ?
                [
                    {
                        id: uuid(),
                        name: templateName,
                        code: html_code
                    },
                    ...smsConfigs
                ] :
                [
                    {
                        id: uuid(),
                        name: templateName,
                        code: html_code
                    }
                ]

            await saveDataToDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, payload, setLoadingProcess)
            loadDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, setLoadingSmsConfigs, setSmsConfigs, [])

            setLoadingProcess(false)
            setVisibleSaveModal(false)
            setNotif({ message: "SMS Template is created", show: true, type: NOTIFICATON_SUCCESS })
        } catch (err) {
            setLoadingProcess(false)
            setNotif({ message: err.message, show: true, type: NOTIFICATON_CRITICAL })
        }
    }

    const handleCloseAttributeModal = () => {
        setVisibleSaveModal(false)
        setCurrentHtmlTagSelected(null)
        setSelectedAttribute(null)
        setSelectedProgram(null)
    }

    const SaveModal = () => visibleSaveModal ? <Modal small onClose={handleCloseAttributeModal}>
        <ModalTitle>
            SMS Template
        </ModalTitle>
        <ModalContent>
            <Field label="SMS Template name">
                <Input onChange={({ value }) => setTemplateName("".concat(value))} value={templateName} placeholder="Template name " />
            </Field>

        </ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button onClick={handleCloseAttributeModal} secondary>
                    close
                </Button>
                <Button onClick={handleSaveTemplate} primary disabled={loadingProcess ? true : false} loading={loadingProcess ? true : false}>
                    Save Report
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal> : <></>


    const RenderCreateSMSTemplate = () => (
        <div className="col-md-7 bg-white p-4 my-shadow border rounded ">
            <div style={{ display: 'flex', alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ textDecoration: "underline" }}>New Template</div>
                <div className="d-flex justify-content-end ml-2">
                    <Button
                        onClick={handleAddAttribute}
                        disabled={currentHtmlTagSelected ? false : true}
                    >Add Attribute</Button>
                    <Button
                        className="ml-2"
                        primary
                        onClick={() => setVisibleSaveModal(true)}
                    >Save Template</Button>
                </div>
            </div>
            <div className="mt-2">
                <div id="summernote-sms-template"></div>
            </div>
        </div>
    )

    const handleDeleteTemplate = async (id, index) => {
        try {
            if (id) {
                setLoadingProcess(false)
                setCurrentTemplateIndex(index)
                const newPayload = smsConfigs.filter(r => r.id !== id)

                await saveDataToDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, newPayload, setLoadingProcess)
                loadDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, setLoadingSmsConfigs, setSmsConfigs, [])

                setNotif({ show: true, message: "Delete success", type: NOTIFICATON_SUCCESS })
                setLoadingProcess(false)
            } else {
                throw new Error("No report selected ")
            }

        } catch (err) {
            setNotif({ show: true, message: err.message, type: NOTIFICATON_CRITICAL })
            setLoadingProcess(false)
        }
    }



    const handleEditReport = (template) => {
        setCurrentSMSTemplate(template)
        setCreateMode(true)
    }

    const RenderSMSTemplateList = () => (
        <div className="col-md-5 ">
            <div className="ml-3 p-4 my-shadow bg-white border rounded w-full">
                <div style={{ textDecoration: "underline" }}>Template List</div>
                <div>
                    <div>
                        {
                            loadingSmsConfigs && (
                                <div className="d-flex align-items-center">

                                </div>
                            )
                        }
                    </div>
                    <div className="mt-2">
                        <Table>
                            <TableHead>
                                <TableRowHead className="bg-light">
                                    <TableCellHead dense>Name</TableCellHead>
                                    <TableCellHead dense>Actions</TableCellHead>
                                </TableRowHead>
                            </TableHead>
                            <TableBody>
                                {smsConfigs?.length > 0 && smsConfigs.map((template, index) => (
                                    <TableRow key={template.id}>
                                        <TableCell dense className="text-text-muted"> {template.name} </TableCell>
                                        <TableCell dense>
                                            <div className='d-flex align-items-center'>
                                                <span className='d-flex align-items-center justify-content-center'>
                                                    <BiEdit style={{ color: "#06695C", fontSize: "18px", cursor: "pointer", background: "#eeeeee20", padding: "2px", borderRadius: "5px", border: "1px solid #ccc" }} onClick={() => handleEditReport(template)} />
                                                </span>
                                                <span className='ml-2 d-flex align-items-center justify-content-center'>
                                                    {loadingProcess && index === currentTemplateIndex && <Spin size='small' className='mr-2' />}
                                                    <RiDeleteBinLine style={{ color: "red", fontSize: "18px", cursor: "pointer", background: "#eeeeee20", padding: "2px", borderRadius: "5px", border: "1px solid #ccc" }} onClick={() => handleDeleteTemplate(template.id, index)} />
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {smsConfigs?.length === 0 && (
                                    <TableRow>
                                        <TableCell dense colSpan="2" className="text-text-muted"> No template ! </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )

    useEffect(() => {
        initSummernote()
        loadPrograms()

        window.oncontextmenu = (e) => {
            e.preventDefault();
            if (currentHtmlTagSelected && selectedAttribute && selectedProgram) {
                setVisibleAddAttributeModal(true)
            }
        }
    }, [])

    return (
        <div className="px-4">
            <div className="my-2">
                <div className="font-weight-bold" style={{ fontSize: "16px" }}>Sms configurations</div>
            </div>
            <hr />
            <div className="row mt-4">
                {RenderCreateSMSTemplate()}
                {RenderSMSTemplateList()}
            </div>
            {AttributeModal()}
            {SaveModal()}
        </div>
    )
}


export default SmsConfigPage