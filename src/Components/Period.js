import React from 'react'
import { ButtonStrip, Modal as DHIS2Modal, ModalActions, ModalContent, ModalTitle, Button as DHIS2Button } from '@dhis2/ui'
import { PeriodDimension } from '@dhis2/analytics'



export const RELATIVE_PERIOD_OPTION_IDS = [
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'BIMONTHLY',
    'SIXMONTHLY',
    'FINANCIAL',
    'YEARLY',
    'QUARTERLY',
]


export const FIXE_PERIOD_OPTION_IDS = [
    'WEEKLYWED',
    'WEEKLYTHU',
    'WEEKLYSAT',
    'WEEKLYSUN',
    'SIXMONTHLYAPR',
    'FYNOV',
    'FYOCT',
    'FYJUL',
    'FYAPR',
    'QUARTERLY',
]


const Period = ({
    visiblePeriodDialog,
    setVisiblePeriodDialog,
    modalTitle = "Period",
    setSelectedPeriods,
    onOk,
    onClose = null,
    includedPeriods = [],
    onSelect
}) => {

    const onPeriodDialogClose = () => {
        setVisiblePeriodDialog(false)
        onClose && onClose()
    }

    const onPeriodDialogOk = () => {
        setVisiblePeriodDialog(false)
        onOk && onOk()
    }

    return visiblePeriodDialog ? (
        <DHIS2Modal
            dataTest="dimension-modal"
            onClose={onPeriodDialogClose}
            position="top"
            large
        >
            <ModalTitle>{modalTitle && modalTitle}</ModalTitle>
            <ModalContent>
                <div>
                    <PeriodDimension
                        onSelect={value => onSelect ? onSelect(value) : setSelectedPeriods(value.items)}
                        selectedPeriods={[]}
                        excludedPeriodTypes={includedPeriods.length > 0 ?
                            [...RELATIVE_PERIOD_OPTION_IDS, ...FIXE_PERIOD_OPTION_IDS]
                                .filter(period => !includedPeriods.includes(period)) : []}
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <DHIS2Button secondary onClick={onPeriodDialogClose}>
                        Close
                    </DHIS2Button>
                    <DHIS2Button primary onClick={onPeriodDialogOk}>
                        OK
                    </DHIS2Button>
                </ButtonStrip>
            </ModalActions>
        </DHIS2Modal>
    ) : <></>
}


export default Period