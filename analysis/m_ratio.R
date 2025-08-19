library(readr)
library(dplyr)
library(tidyr)
library(cmdstanr)

K <- 5          ## number of confidence levels
FILENAME <- '../data/pilot/experiment_data.csv'


## preprocess the data, focusing on main_task trials
## and binning the trials by [response, accuracy, confidence]
d <- read_csv(FILENAME) %>%
    filter(phase == 'main_task',
           task %in% c('rdm_decision', 'local_confidence')) %>%
    mutate(trial=rep(seq_len(n()/2), each=2)) %>%
    select(trial, task, response, correct) %>%
    pivot_wider(names_from=task, values_from=response:correct) %>%
    select(-correct_local_confidence) %>%
    mutate_all(as.integer) %>%
    rename(response=response_rdm_decision,
           confidence=response_local_confidence,
           correct=correct_rdm_decision) %>%
    group_by(response, correct, confidence, .drop=FALSE) %>%
    count() %>%
    ungroup %>%
    complete(response=0:1, correct=0:1, confidence=1:K, fill=list(n=0))



standata <- list(
    N=nrow(d),
    K=5,
    C=d %>%
        arrange(confidence, correct, response) %>%
        pull(n) %>%
        array(dim=c(2, 2, K)),
    prior_sd_d_prime=.5,
    prior_sd_c=.5,
    prior_sd_log_M=.25,
    prior_mean_meta_c2=-1,
    prior_sd_meta_c2=1,
    prior_only=FALSE
)


m <- cmdstan_model('metad_summary.stan')
fit <- m$sample(data=standata)

fit$summary(c('d_prime', 'c', 'log_M', 'meta_d_prime', 'meta_c', 'meta_c2_0', 'meta_c2_1')) %>%
    select(variable, mean)
