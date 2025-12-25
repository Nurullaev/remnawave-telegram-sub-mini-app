import '@gfazioli/mantine-spinner/styles.css';

import { Center, Progress, Stack, Text } from '@mantine/core'
import {Spinner} from "@gfazioli/mantine-spinner";

export function Loading({
                                  height = '100vh',
                                  text = undefined,
                                  value = 100
                              }: {
    height?: string
    text?: string
    value?: number
}) {
    return (
        <Center h={height}>
            <Stack align="center" gap="xs" w="100%">
                <Spinner
                    inner={50}
                    segments={30}
                    size={150}
                    speed={1_900}
                    strokeLinecap="butt"
                    thickness={2}
                />
            </Stack>
        </Center>
    )
}
